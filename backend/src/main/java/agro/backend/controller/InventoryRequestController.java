package agro.backend.controller;

import agro.backend.model.InventoryRequest;
import agro.backend.model.User;
import agro.backend.repository.UserRepository;
import agro.backend.service.InventoryRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory-requests")
@RequiredArgsConstructor
public class InventoryRequestController {

    private final InventoryRequestService inventoryRequestService;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        if (principal == null) throw new UsernameNotFoundException("Nu sunteți autentificat.");
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizator negăsit."));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<List<InventoryRequest>> getRequests(Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(inventoryRequestService.getFarmRequests(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('AGRONOMIST')")
    public ResponseEntity<InventoryRequest> createRequest(@RequestBody InventoryRequest request, Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(inventoryRequestService.createRequest(request, user));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<InventoryRequest> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        User user = getCurrentUser(principal);
        String newStatus = body.get("status");
        if (newStatus == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(inventoryRequestService.updateRequestStatus(id, newStatus, user));
    }
}
