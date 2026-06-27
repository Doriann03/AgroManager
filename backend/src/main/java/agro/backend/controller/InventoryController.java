package agro.backend.controller;

import agro.backend.model.InventoryItem;
import agro.backend.model.User;
import agro.backend.model.dto.InventoryItemRequestDTO;
import agro.backend.repository.UserRepository;
import agro.backend.service.InventoryService;
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
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
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
    public ResponseEntity<List<InventoryItem>> getMyInventory(Principal principal) {
        User currentUser = getCurrentUser(principal);
        if (currentUser.getFarm() == null) {
            return ResponseEntity.badRequest().body(List.of());
        }
        return ResponseEntity.ok(inventoryService.getInventoryByFarm(currentUser.getFarm().getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<InventoryItem> createItem(@Valid @RequestBody InventoryItemRequestDTO item, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            return ResponseEntity.ok(inventoryService.saveItem(item, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @Valid @RequestBody InventoryItemRequestDTO item, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            InventoryItem updatedItem = inventoryService.updateItem(id, item, currentUser);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, Principal principal) {
        User currentUser = getCurrentUser(principal);
        inventoryService.deleteItem(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
