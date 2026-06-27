package agro.backend.controller;

import agro.backend.model.ParcelNdviHistory;
import agro.backend.model.User;
import agro.backend.repository.UserRepository;
import agro.backend.service.NdviService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/ndvi")
@RequiredArgsConstructor
public class NdviController {

    private final NdviService ndviService;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new UsernameNotFoundException("Utilizatorul nu este autentificat.");
        }
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost gasit: " + principal.getName()));
    }

    @GetMapping("/parcel/{parcelId}")
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST', 'SUPER_ADMIN')")
    public ResponseEntity<ParcelNdviHistory> getParcelNdvi(
            @PathVariable Long parcelId,
            @RequestParam("period") String periodKey,
            Principal principal) {

        User currentUser = getCurrentUser(principal);
        ParcelNdviHistory history = ndviService.getNdviForParcel(parcelId, periodKey, currentUser);
        return ResponseEntity.ok(history);
    }
}
