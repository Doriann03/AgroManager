package agro.backend.controller;

import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.dto.ParcelRequestDTO;
import agro.backend.repository.UserRepository;
import agro.backend.service.ParcelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/parcels")
@RequiredArgsConstructor
public class ParcelController {

    private final ParcelService parcelService;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new UsernameNotFoundException("Utilizatorul nu este autentificat.");
        }
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost gasit: " + principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<List<Parcel>> getMyParcels(Principal principal) {
        User currentUser = getCurrentUser(principal);
        if (currentUser.getFarm() == null) {
            return ResponseEntity.badRequest().body(List.of());
        }
        List<Parcel> parcels = parcelService.getParcelsByFarm(currentUser.getFarm().getId());
        return ResponseEntity.ok(parcels);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<Parcel> create(@Valid @RequestBody ParcelRequestDTO parcel, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Parcel savedParcel = parcelService.saveParcel(parcel, currentUser);
            return ResponseEntity.ok(savedParcel);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('AGRONOMIST')")
    public ResponseEntity<Parcel> update(@PathVariable Long id, @Valid @RequestBody ParcelRequestDTO parcel, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Parcel updatedParcel = parcelService.updateParcel(id, parcel, currentUser);
            return ResponseEntity.ok(updatedParcel);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AGRONOMIST')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        User currentUser = getCurrentUser(principal);
        parcelService.deleteParcel(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
