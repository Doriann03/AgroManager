package agro.backend.service;

import agro.backend.model.CropSeason;
import agro.backend.model.Parcel;
import agro.backend.model.dto.CropSeasonRequestDTO;
import agro.backend.model.dto.CropSeasonResponseDTO;
import agro.backend.repository.CropSeasonRepository;
import agro.backend.repository.ParcelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CropSeasonService {

    private final CropSeasonRepository cropSeasonRepository;
    private final ParcelRepository parcelRepository;

    public List<CropSeasonResponseDTO> getSeasonsByParcelId(Long parcelId, String username) {
        // Opțional: putem adăuga verificare dacă utilizatorul deține parcela
        List<CropSeason> seasons = cropSeasonRepository.findByParcelIdOrderByHarvestYearDesc(parcelId);
        return seasons.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public CropSeasonResponseDTO addSeason(CropSeasonRequestDTO dto, String username) {
        Parcel parcel = parcelRepository.findById(dto.getParcelId())
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost găsită."));
                
        if (!parcel.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("Nu aveți permisiunea de a modifica această parcelă.");
        }

        CropSeason season = new CropSeason();
        season.setHarvestYear(dto.getHarvestYear());
        season.setCropType(dto.getCropType());
        season.setParcel(parcel);

        CropSeason savedSeason = cropSeasonRepository.save(season);
        
        // Dacă este anul curent, ar trebui să actualizăm și cropType-ul din Parcel?
        // Momentan lăsăm independent, dar se poate lega.
        
        return mapToDTO(savedSeason);
    }
    
    // Metodă pentru a mapa din Entitate în DTO, respectând arhitectura clean
    private CropSeasonResponseDTO mapToDTO(CropSeason season) {
        CropSeasonResponseDTO dto = new CropSeasonResponseDTO();
        dto.setId(season.getId());
        dto.setHarvestYear(season.getHarvestYear());
        dto.setCropType(season.getCropType());
        dto.setParcelId(season.getParcel().getId());
        return dto;
    }
}