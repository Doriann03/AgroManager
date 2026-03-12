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

    // Returnează parcelele doar pentru utilizatorul autentificat
    @GetMapping
    public ResponseEntity<List<Parcel>> getMyParcels(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        List<Parcel> parcels = parcelService.getParcelsByUsername(principal.getName());
        return ResponseEntity.ok(parcels);
    }

    @PostMapping
    public ResponseEntity<Parcel> create(@RequestBody Parcel parcel, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        Parcel savedParcel = parcelService.saveParcel(parcel, principal.getName());
        return ResponseEntity.ok(savedParcel);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        parcelService.deleteParcel(id);
    }
}