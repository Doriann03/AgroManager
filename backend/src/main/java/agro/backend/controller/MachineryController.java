package agro.backend.controller;

import agro.backend.model.Machinery;
import agro.backend.model.User;
import agro.backend.model.dto.MachineryRequestDTO;
import agro.backend.repository.UserRepository;
import agro.backend.service.MachineryService;
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
@RequestMapping("/api/machinery")
@RequiredArgsConstructor
public class MachineryController {

    private final MachineryService machineryService;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new UsernameNotFoundException("Utilizatorul nu este autentificat.");
        }
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost gasit: " + principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST', 'SUPER_ADMIN')")
    public ResponseEntity<List<Machinery>> getMyMachinery(Principal principal) {
        User currentUser = getCurrentUser(principal);
        if (currentUser.getFarm() == null) {
            return ResponseEntity.badRequest().body(List.of());
        }
        List<Machinery> machineryList = machineryService.getMachineryByFarm(currentUser.getFarm().getId());
        return ResponseEntity.ok(machineryList);
    }

    @PostMapping
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<Machinery> create(@Valid @RequestBody MachineryRequestDTO machinery, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Machinery savedMachinery = machineryService.saveMachinery(machinery, currentUser);
            return ResponseEntity.ok(savedMachinery);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<Machinery> update(@PathVariable Long id, @Valid @RequestBody MachineryRequestDTO machinery, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Machinery updatedMachinery = machineryService.updateMachinery(id, machinery, currentUser);
            return ResponseEntity.ok(updatedMachinery);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        User currentUser = getCurrentUser(principal);
        machineryService.deleteMachinery(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
