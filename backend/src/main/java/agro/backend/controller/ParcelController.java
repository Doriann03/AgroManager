package agro.backend.controller;

import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.repository.UserRepository;
import agro.backend.service.ParcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/parcels")
@RequiredArgsConstructor
public class ParcelController {

    private final ParcelService parcelService;
    private final UserRepository userRepository; // Injectăm UserRepository pentru a obține User-ul complet

    // Helper method to get the current authenticated user
    private User getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new UsernameNotFoundException("Utilizatorul nu este autentificat.");
        }
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost găsit: " + principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Parcel>> getMyParcels(Principal principal) {
        User currentUser = getCurrentUser(principal);
        if (currentUser.getFarm() == null) {
            return ResponseEntity.badRequest().body(List.of()); // Utilizatorul nu are o fermă asociată
        }
        List<Parcel> parcels = parcelService.getParcelsByFarm(currentUser.getFarm().getId());
        return ResponseEntity.ok(parcels);
    }

    @PostMapping
    public ResponseEntity<Parcel> create(@RequestBody Parcel parcel, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Parcel savedParcel = parcelService.saveParcel(parcel, currentUser);
            return ResponseEntity.ok(savedParcel);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Parcel> update(@PathVariable Long id, @RequestBody Parcel parcel, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Parcel updatedParcel = parcelService.updateParcel(id, parcel, currentUser);
            return ResponseEntity.ok(updatedParcel);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        // Aici ar trebui adăugată o verificare de securitate similară cu update/save
        parcelService.deleteParcel(id);
    }
}
