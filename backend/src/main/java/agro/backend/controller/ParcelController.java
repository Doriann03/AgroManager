package agro.backend.controller;

import agro.backend.model.Parcel;
import agro.backend.service.ParcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/parcels")
@RequiredArgsConstructor
public class ParcelController {

    private final ParcelService parcelService;

    @GetMapping
    public ResponseEntity<List<Parcel>> getMyParcels(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<Parcel> parcels = parcelService.getParcelsByUsername(principal.getName());
        return ResponseEntity.ok(parcels);
    }

    @PostMapping
    public ResponseEntity<Parcel> create(@RequestBody Parcel parcel, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Parcel savedParcel = parcelService.saveParcel(parcel, principal.getName());
        return ResponseEntity.ok(savedParcel);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Parcel> update(@PathVariable Long id, @RequestBody Parcel parcel, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            Parcel updatedParcel = parcelService.updateParcel(id, parcel, principal.getName());
            return ResponseEntity.ok(updatedParcel);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        parcelService.deleteParcel(id);
    }
}