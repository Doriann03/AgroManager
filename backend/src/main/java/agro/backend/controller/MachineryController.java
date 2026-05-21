package agro.backend.controller;

import agro.backend.model.Machinery;
import agro.backend.model.User;
import agro.backend.repository.UserRepository;
import agro.backend.service.MachineryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

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
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost găsit: " + principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Machinery>> getMyMachinery(Principal principal) {
        User currentUser = getCurrentUser(principal);
        if (currentUser.getFarm() == null) {
            return ResponseEntity.badRequest().body(List.of());
        }
        List<Machinery> machineryList = machineryService.getMachineryByFarm(currentUser.getFarm().getId());
        return ResponseEntity.ok(machineryList);
    }

    @PostMapping
    public ResponseEntity<Machinery> create(@RequestBody Machinery machinery, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Machinery savedMachinery = machineryService.saveMachinery(machinery, currentUser);
            return ResponseEntity.ok(savedMachinery);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Machinery> update(@PathVariable Long id, @RequestBody Machinery machinery, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Machinery updatedMachinery = machineryService.updateMachinery(id, machinery, currentUser);
            return ResponseEntity.ok(updatedMachinery);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Aici ar trebui adăugată o verificare de securitate similară cu update/save
        machineryService.deleteMachinery(id);
        return ResponseEntity.noContent().build();
    }
}
