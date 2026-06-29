package agro.backend.service;

import agro.backend.model.CropSeason;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.dto.CropSeasonFinancialRequestDTO;
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
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost gasita."));

        if (currentUser.getFarm() == null || !parcel.getFarm().getId().equals(currentUser.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea de a vedea sezoanele acestei parcele.");
        }

        List<CropSeason> seasons = cropSeasonRepository.findByParcelIdOrderByHarvestYearDesc(parcelId);
        return seasons.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<CropSeasonResponseDTO> getAllSeasonsForFarm(String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        if (currentUser.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio ferma.");
        }

        return cropSeasonRepository.findAllByParcelFarmId(currentUser.getFarm().getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CropSeasonResponseDTO addSeason(CropSeasonRequestDTO dto, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        if (currentUser.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio ferma.");
        }

        Parcel parcel = parcelRepository.findById(dto.getParcelId())
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost gasita."));

        if (!parcel.getFarm().getId().equals(currentUser.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea de a modifica aceasta parcela.");
        }

        CropSeason season = new CropSeason();
        season.setHarvestYear(dto.getHarvestYear());
        season.setCropType(dto.getCropType());
        season.setParcel(parcel);
        season.setTotalYieldKg(dto.getTotalYieldKg());
        season.setSalePricePerKg(dto.getSalePricePerKg());
        season.setRevenueOverride(dto.getRevenueOverride());

        CropSeason savedSeason = cropSeasonRepository.save(season);

        return mapToDTO(savedSeason);
    }

    public CropSeasonResponseDTO updateSeason(Long seasonId, CropSeasonRequestDTO dto, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        CropSeason season = cropSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new RuntimeException("Sezonul nu a fost gasit."));

        if (currentUser.getFarm() == null || !season.getParcel().getFarm().getId().equals(currentUser.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea de a modifica acest sezon.");
        }

        if (dto.getTotalYieldKg() != null) {
            season.setTotalYieldKg(dto.getTotalYieldKg());
        }

        if (dto.getHarvestYear() != null) {
            season.setHarvestYear(dto.getHarvestYear());
        }
        if (dto.getCropType() != null) {
            season.setCropType(dto.getCropType());
        }
        if (dto.getSalePricePerKg() != null) {
            season.setSalePricePerKg(dto.getSalePricePerKg());
        }
        if (dto.getRevenueOverride() != null) {
            season.setRevenueOverride(dto.getRevenueOverride());
        }

        CropSeason updated = cropSeasonRepository.save(season);
        return mapToDTO(updated);
    }

    public CropSeasonResponseDTO updateSeasonFinancials(Long seasonId, CropSeasonFinancialRequestDTO dto, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        CropSeason season = cropSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new RuntimeException("Sezonul nu a fost gasit."));

        if (currentUser.getFarm() == null || !season.getParcel().getFarm().getId().equals(currentUser.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea de a modifica acest sezon.");
        }

        season.setSalePricePerKg(dto.getSalePricePerKg());
        season.setRevenueOverride(dto.getRevenueOverride());

        CropSeason updated = cropSeasonRepository.save(season);
        return mapToDTO(updated);
    }

    private CropSeasonResponseDTO mapToDTO(CropSeason season) {
        CropSeasonResponseDTO dto = new CropSeasonResponseDTO();
        dto.setId(season.getId());
        dto.setHarvestYear(season.getHarvestYear());
        dto.setCropType(season.getCropType());
        dto.setParcelId(season.getParcel().getId());
        dto.setTotalYieldKg(season.getTotalYieldKg());
        dto.setSalePricePerKg(season.getSalePricePerKg());
        dto.setRevenueOverride(season.getRevenueOverride());
        return dto;
    }
}
