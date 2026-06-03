package agro.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/strategy")
    public ResponseEntity<?> getWeatherStrategy(@RequestParam double lat, @RequestParam double lon) {
        String url = String.format(java.util.Locale.US,
            "https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,evapotranspiration&daily=sunrise,sunset,uv_index_max,precipitation_sum,et0_fao_evapotranspiration&timezone=auto",
            lat, lon
        );

        try {
            Map<String, Object> forecast = restTemplate.getForObject(url, Map.class);
            Map<String, Object> response = new HashMap<>();
            response.put("forecast", forecast);
            response.put("recommendations", generateRecommendations(forecast));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Eroare la preluarea datelor meteo.");
        }
    }

    private Map<String, String> generateRecommendations(Map<String, Object> forecast) {
        Map<String, String> recommendations = new HashMap<>();
        
        try {
            Map<String, Object> hourly = (Map<String, Object>) forecast.get("hourly");
            Map<String, Object> daily = (Map<String, Object>) forecast.get("daily");
            
            if (hourly == null || daily == null) return getDefaultRecommendations();

            // 1. Fereastră Erbicidare (Căutăm prima fereastră cu vânt < 10 km/h în următoarele 48h)
            List<Double> windSpeeds = (List<Double>) hourly.get("wind_speed_10m");
            List<String> times = (List<String>) hourly.get("time");
            List<Integer> precipProbs = (List<Integer>) hourly.get("precipitation_probability");
            
            String sprayingMsg = "Nu s-au găsit ferestre optime (vânt peste 15km/h).";
            for (int i = 0; i < 48 && i < windSpeeds.size(); i++) {
                if (windSpeeds.get(i) != null && windSpeeds.get(i) < 10 && (precipProbs == null || (precipProbs.get(i) != null && precipProbs.get(i) < 20))) {
                    String timeStr = times.get(i).split("T")[1];
                    sprayingMsg = String.format("Optimă la ora %s (vânt %.1f km/h). Condiții de absorbție bune.", timeStr, windSpeeds.get(i));
                    break;
                }
            }
            recommendations.put("sprayingWindow", sprayingMsg);

            // 2. Necesar Irigații (Bilanț Hidric pe 7 zile)
            List<Double> etSum = (List<Double>) daily.get("et0_fao_evapotranspiration");
            List<Double> rainSum = (List<Double>) daily.get("precipitation_sum");
            
            double totalET = etSum != null ? etSum.stream().filter(Objects::nonNull).mapToDouble(d -> d).sum() : 0;
            double totalRain = rainSum != null ? rainSum.stream().filter(Objects::nonNull).mapToDouble(d -> d).sum() : 0;
            double deficit = totalET - totalRain;

            String irrigationMsg;
            if (deficit > 15) irrigationMsg = String.format("RIDICAT. Deficit de %.1f mm prognozat pe 7 zile. Solicitare mare.", deficit);
            else if (deficit > 5) irrigationMsg = String.format("MODERAT. Pierdere de apă de %.1f mm. Monitorizați umiditatea.", deficit);
            else irrigationMsg = "SCĂZUT. Precipitațiile acoperă necesarul de evapotranspirație.";
            recommendations.put("irrigationNeed", irrigationMsg);

            // 3. Condiții Recoltare
            boolean harvestOk = true;
            if (rainSum != null) {
                for (int i = 0; i < 3 && i < rainSum.size(); i++) {
                    if (rainSum.get(i) != null && rainSum.get(i) > 0.5) { harvestOk = false; break; }
                }
            }
            recommendations.put("harvestCondition", harvestOk ? "EXCELENTE. Fără ploi în următoarele 72 ore." : "RESTRICTATE. Risc de precipitații sau umiditate mare.");

            // 4. Analiza Strategică
            List<Double> uvMax = (List<Double>) daily.get("uv_index_max");
            double maxUV = uvMax != null ? uvMax.stream().filter(Objects::nonNull).mapToDouble(d -> d).max().orElse(0) : 0;
            
            String strategyMsg = "Stabilitate climatică prognozată.";
            if (maxUV > 7) strategyMsg = String.format("ALERTA STRES TERMIC: UV Index de %.1f. Aplicați biostimulatori pentru protecția culturilor.", maxUV);
            else if (totalRain < 2) strategyMsg = "ALERTA SECETĂ: Lipsă precipitații pe 7 zile. Prioritizați conservarea apei.";
            recommendations.put("strategicAnalysis", strategyMsg);

        } catch (Exception e) {
            e.printStackTrace();
            return getDefaultRecommendations();
        }
        
        return recommendations;
    }

    private Map<String, String> getDefaultRecommendations() {
        Map<String, String> recommendations = new HashMap<>();
        recommendations.put("sprayingWindow", "Informații indisponibile.");
        recommendations.put("irrigationNeed", "Se calculează...");
        recommendations.put("harvestCondition", "Verificați prognoza orară.");
        recommendations.put("strategicAnalysis", "Analiză în curs.");
        return recommendations;
    }
}
