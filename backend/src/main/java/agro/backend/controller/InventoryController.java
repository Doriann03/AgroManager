package agro.backend.controller;

import agro.backend.model.InventoryItem;
import agro.backend.model.User;
import agro.backend.repository.UserRepository;
import agro.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

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
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost găsit: " + principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<InventoryItem>> getMyInventory(Principal principal) {
        User currentUser = getCurrentUser(principal);
        if (currentUser.getFarm() == null) {
            return ResponseEntity.badRequest().body(List.of());
        }
        return ResponseEntity.ok(inventoryService.getInventoryByFarm(currentUser.getFarm().getId()));
    }

    @PostMapping
    public ResponseEntity<InventoryItem> createItem(@RequestBody InventoryItem item, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            return ResponseEntity.ok(inventoryService.saveItem(item, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @RequestBody InventoryItem item, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            InventoryItem updatedItem = inventoryService.updateItem(id, item, currentUser);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        // Aici ar trebui adăugată o verificare de securitate similară cu update/save
        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
