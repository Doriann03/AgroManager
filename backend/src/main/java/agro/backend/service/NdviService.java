package agro.backend.service;

import agro.backend.model.Parcel;
import agro.backend.model.ParcelNdviHistory;
import agro.backend.repository.ParcelNdviHistoryRepository;
import agro.backend.repository.ParcelRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NdviService {

    private static final Logger logger = LoggerFactory.getLogger(NdviService.class);
    private static final String TOKEN_URL = "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token";
    private static final String STATISTICS_URL = "https://services.sentinel-hub.com/api/v1/statistics";
    private static final long TOKEN_MARGIN_SECONDS = 60;

    private final ParcelNdviHistoryRepository ndviHistoryRepository;
    private final ParcelRepository parcelRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${sentinel-hub.client-id:}")
    private String clientId;

    @Value("${sentinel-hub.client-secret:}")
    private String clientSecret;

    private String cachedToken;
    private long tokenExpiresAtEpoch = 0;

    @SuppressWarnings("unchecked")
    private synchronized String getAccessToken() {
        long now = System.currentTimeMillis() / 1000;
        if (cachedToken != null && now < (tokenExpiresAtEpoch - TOKEN_MARGIN_SECONDS)) {
            logger.debug("Reutilizam token-ul OAuth2 din cache.");
            return cachedToken;
        }

        logger.info("Cerem token OAuth2 nou de la Sentinel Hub...");
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(TOKEN_URL, requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null || !responseBody.containsKey("access_token")) {
                throw new RuntimeException("Raspunsul OAuth2 nu contine access_token.");
            }

            cachedToken = (String) responseBody.get("access_token");
            Object expiresInObj = responseBody.get("expires_in");
            int expiresIn = 86400;
            if (expiresInObj instanceof Number) {
                expiresIn = ((Number) expiresInObj).intValue();
            }
            tokenExpiresAtEpoch = now + expiresIn;

            logger.info("Token OAuth2 obtinut cu succes. Expira in {} secunde.", expiresIn);
            return cachedToken;
        } catch (Exception e) {
            throw new RuntimeException("Eroare la obtinerea token-ului OAuth2 Sentinel Hub: " + e.getMessage(), e);
        }
    }

    @Transactional
    public ParcelNdviHistory getNdviForParcel(Long parcelId, String periodKey) {
        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost gasita."));

        Optional<ParcelNdviHistory> existingHistoryOpt = ndviHistoryRepository.findByParcelIdAndPeriodKey(parcelId, periodKey);
        ParcelNdviHistory history = existingHistoryOpt.orElse(new ParcelNdviHistory());

        try {
            String coordinatesJson = parcel.getCoordinatesJson();
            if (coordinatesJson == null || coordinatesJson.isEmpty()) {
                throw new RuntimeException("Parcela nu are coordonate definite.");
            }

            String geoJsonGeometry = convertToGeoJsonGeometry(coordinatesJson);

            YearMonth yearMonth = YearMonth.parse(periodKey);
            String lastDayOfMonth = String.valueOf(yearMonth.atEndOfMonth().getDayOfMonth());

            String evalscript = buildEvalscript();

            String jsonPayload = """
                {
                  "input": {
                    "bounds": {
                      "geometry": %s
                    },
                    "data": [
                      {
                        "type": "sentinel-2-l2a",
                        "dataFilter": {
                          "mosaickingOrder": "leastCC"
                        }
                      }
                    ]
                  },
                  "aggregation": {
                    "timeRange": {
                      "from": "%s-01T00:00:00Z",
                      "to": "%s-%sT23:59:59Z"
                    },
                    "aggregationInterval": {
                      "of": "P30D"
                    },
                    "evalscript": "%s"
                  }
                }
                """.formatted(geoJsonGeometry, periodKey, periodKey, lastDayOfMonth, escapeJsonString(evalscript));

            String accessToken = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);

            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(STATISTICS_URL, requestEntity, Map.class);
            Map responseMap = responseEntity.getBody();

            Double actualNdvi = extractNdviFromMap(responseMap);

            history.setParcelId(parcelId);
            history.setPeriodKey(periodKey);
            history.setNdviValue(actualNdvi);
            history.setIsMockData(false);

            logger.info("NDVI live de la Sentinel Hub API pentru parcela {} si perioada {}: {}", parcelId, periodKey, actualNdvi);
            return ndviHistoryRepository.save(history);

        } catch (Exception e) {
            logger.warn("Eroare API Satelit: {}", e.getMessage());

            if (existingHistoryOpt.isPresent()) {
                logger.info("Folosim valoarea salvata in baza de date (Fallback) pentru parcela {} siperioada {}", parcelId, periodKey);
                return existingHistoryOpt.get();
            }

            logger.info("Nu exista date in DB. Generam valoare de rezerva (Mock) pentru parcela {} siperioada {}", parcelId, periodKey);
            Double mockValue = generateMockNdviValue(periodKey);

            history.setParcelId(parcelId);
            history.setPeriodKey(periodKey);
            history.setNdviValue(mockValue);
            history.setIsMockData(true);

            return ndviHistoryRepository.save(history);
        }
    }

    @SuppressWarnings("unchecked")
    private String convertToGeoJsonGeometry(String coordinatesJson) {
        try {
            JsonNode coordsArray = objectMapper.readTree(coordinatesJson);
            ArrayNode ring = objectMapper.createArrayNode();
            for (JsonNode coord : coordsArray) {
                double lat = coord.get(0).asDouble();
                double lng = coord.get(1).asDouble();
                ArrayNode geoJsonCoord = objectMapper.createArrayNode();
                geoJsonCoord.add(lng);
                geoJsonCoord.add(lat);
                ring.add(geoJsonCoord);
            }
            JsonNode first = coordsArray.get(0);
            ArrayNode closingCoord = objectMapper.createArrayNode();
            closingCoord.add(first.get(1).asDouble());
            closingCoord.add(first.get(0).asDouble());
            ring.add(closingCoord);

            ArrayNode rings = objectMapper.createArrayNode();
            rings.add(ring);

            ObjectNode geometry = objectMapper.createObjectNode();
            geometry.put("type", "Polygon");
            geometry.set("coordinates", rings);

            return objectMapper.writeValueAsString(geometry);
        } catch (Exception e) {
            throw new RuntimeException("Eroare conversie coordonate in GeoJSON: " + e.getMessage(), e);
        }
    }

    private String buildEvalscript() {
        return "//VERSION=3\n" +
                "function setup() {\n" +
                "  return {\n" +
                "    input: [{bands: [\"B04\", \"B08\", \"dataMask\"]}],\n" +
                "    output: [{id: \"ndvi\", bands: 1, sampleType: \"FLOAT32\"}, {id: \"dataMask\", bands: 1}]\n" +
                "  };\n" +
                "}\n" +
                "function evaluatePixel(samples) {\n" +
                "  let ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);\n" +
                "  return {ndvi: [ndvi], dataMask: [samples.dataMask]};\n" +
                "}";
    }

    private String escapeJsonString(String value) {
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    @SuppressWarnings("unchecked")
    private Double extractNdviFromMap(Map<String, Object> responseMap) {
        try {
            if (responseMap == null || !responseMap.containsKey("data")) {
                throw new RuntimeException("Raspunsul nu contine campul 'data'.");
            }

            List<Map<String, Object>> dataList = (List<Map<String, Object>>) responseMap.get("data");
            if (dataList == null || dataList.isEmpty()) {
                throw new RuntimeException("Lista 'data' este goala.");
            }

            Map<String, Object> firstDataObj = dataList.get(0);
            Map<String, Object> outputs = (Map<String, Object>) firstDataObj.get("outputs");
            if (outputs == null) {
                throw new RuntimeException("Nu exista 'outputs' in raspuns.");
            }

            Map<String, Object> ndvi = (Map<String, Object>) outputs.get("ndvi");
            if (ndvi == null) {
                throw new RuntimeException("Nu exista output 'ndvi' in raspuns.");
            }

            Map<String, Object> statistics = (Map<String, Object>) ndvi.get("statistics");
            if (statistics != null) {
                Map<String, Object> def = (Map<String, Object>) statistics.get("default");
                if (def != null && def.containsKey("median")) {
                    Object medianObj = def.get("median");
                    if (medianObj instanceof Number) return ((Number) medianObj).doubleValue();
                }
            }

            Map<String, Object> bands = (Map<String, Object>) ndvi.get("bands");
            if (bands != null) {
                Map<String, Object> b0 = (Map<String, Object>) bands.get("B0");
                if (b0 != null) {
                    Map<String, Object> stats = (Map<String, Object>) b0.get("stats");
                    if (stats != null && stats.containsKey("median")) {
                        Object medianObj = stats.get("median");
                        if (medianObj instanceof Number) return ((Number) medianObj).doubleValue();
                    }
                }
            }

            throw new RuntimeException("Nu s-a gasit valoarea NDVI (median) in structura raspunsului.");
        } catch (ClassCastException e) {
            throw new RuntimeException("Structura raspunsului API nu este asteptata: " + e.getMessage(), e);
        }
    }

    private Double generateMockNdviValue(String periodKey) {
        String[] parts = periodKey.split("-");
        if (parts.length != 2) return 0.3;

        int month = Integer.parseInt(parts[1]);

        if (month >= 3 && month <= 4) return 0.35 + (Math.random() * 0.2);
        if (month >= 5 && month <= 7) return 0.65 + (Math.random() * 0.25);
        if (month >= 8 && month <= 10) return 0.40 + (Math.random() * 0.3);
        return 0.15 + (Math.random() * 0.1);
    }
}
