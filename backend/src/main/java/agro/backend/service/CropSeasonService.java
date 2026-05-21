package agro.backend.service;

import agro.backend.model.CropSeason;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.dto.CropSeasonRequestDTO;
import agro.backend.model.dto.CropSeasonResponseDTO;
import agro.backend.repository.CropSeasonRepository;
import agro.backend.repository.ParcelRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CropSeasonService {

    private final CropSeasonRepository cropSeasonRepository;
    private final ParcelRepository parcelRepository;
    private final UserRepository userRepository;

    public List<CropSeasonResponseDTO> getSeasonsByParcelId(Long parcelId, String username) {
        // Aici ar trebui să verificăm dacă utilizatorul are acces la fermă
        List<CropSeason> seasons = cropSeasonRepository.findByParcelIdOrderByHarvestYearDesc(parcelId);
        return seasons.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public CropSeasonResponseDTO addSeason(CropSeasonRequestDTO dto, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit."));

        if (currentUser.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio fermă.");
        }

        Parcel parcel = parcelRepository.findById(dto.getParcelId())
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost găsită."));
                
        if (!parcel.getFarm().getId().equals(currentUser.getFarm().getId())) {
            throw new RuntimeException("Nu aveți permisiunea de a modifica această parcelă.");
        }

        CropSeason season = new CropSeason();
        season.setHarvestYear(dto.getHarvestYear());
        season.setCropType(dto.getCropType());
        season.setParcel(parcel);

        CropSeason savedSeason = cropSeasonRepository.save(season);
        
        return mapToDTO(savedSeason);
    }
    
    private CropSeasonResponseDTO mapToDTO(CropSeason season) {
        CropSeasonResponseDTO dto = new CropSeasonResponseDTO();
        dto.setId(season.getId());
        dto.setHarvestYear(season.getHarvestYear());
        dto.setCropType(season.getCropType());
        dto.setParcelId(season.getParcel().getId());
        return dto;
    }
}
