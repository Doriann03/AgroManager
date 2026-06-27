package agro.backend.controller;

import agro.backend.model.dto.CropSeasonRequestDTO;
import agro.backend.model.dto.CropSeasonResponseDTO;
import agro.backend.service.CropSeasonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/crop-seasons")
@RequiredArgsConstructor
public class CropSeasonController {

    private final CropSeasonService cropSeasonService;

    @GetMapping("/parcel/{parcelId}")
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<List<CropSeasonResponseDTO>> getSeasonsForParcel(@PathVariable Long parcelId, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        List<CropSeasonResponseDTO> seasons = cropSeasonService.getSeasonsByParcelId(parcelId, principal.getName());
        return ResponseEntity.ok(seasons);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<List<CropSeasonResponseDTO>> getAllSeasons(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cropSeasonService.getAllSeasonsForFarm(principal.getName()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<CropSeasonResponseDTO> addSeason(@RequestBody CropSeasonRequestDTO requestDTO, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            CropSeasonResponseDTO savedSeason = cropSeasonService.addSeason(requestDTO, principal.getName());
            return ResponseEntity.ok(savedSeason);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{seasonId}")
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<CropSeasonResponseDTO> updateSeason(@PathVariable Long seasonId, @RequestBody CropSeasonRequestDTO requestDTO, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            CropSeasonResponseDTO updatedSeason = cropSeasonService.updateSeason(seasonId, requestDTO, principal.getName());
            return ResponseEntity.ok(updatedSeason);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
