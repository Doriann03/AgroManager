package agro.backend.controller;

import agro.backend.model.ParcelNdviHistory;
import agro.backend.service.NdviService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ndvi")
@RequiredArgsConstructor
public class NdviController {

    private final NdviService ndviService;

    @GetMapping("/parcel/{parcelId}")
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST', 'SUPER_ADMIN')")
    public ResponseEntity<ParcelNdviHistory> getParcelNdvi(
            @PathVariable Long parcelId,
            @RequestParam("period") String periodKey) {
        
        ParcelNdviHistory history = ndviService.getNdviForParcel(parcelId, periodKey);
        return ResponseEntity.ok(history);
    }
}
