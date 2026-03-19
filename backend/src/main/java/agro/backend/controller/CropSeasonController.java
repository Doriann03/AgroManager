package agro.backend.controller;

import agro.backend.model.dto.CropSeasonRequestDTO;
import agro.backend.model.dto.CropSeasonResponseDTO;
import agro.backend.service.CropSeasonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/crop-seasons")
@RequiredArgsConstructor
public class CropSeasonController {

    private final CropSeasonService cropSeasonService;

    @GetMapping("/parcel/{parcelId}")
    public ResponseEntity<List<CropSeasonResponseDTO>> getSeasonsForParcel(@PathVariable Long parcelId, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        List<CropSeasonResponseDTO> seasons = cropSeasonService.getSeasonsByParcelId(parcelId, principal.getName());
        return ResponseEntity.ok(seasons);
    }

    @PostMapping
    public ResponseEntity<CropSeasonResponseDTO> addSeason(@RequestBody CropSeasonRequestDTO requestDTO, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            CropSeasonResponseDTO savedSeason = cropSeasonService.addSeason(requestDTO, principal.getName());
            return ResponseEntity.ok(savedSeason);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}