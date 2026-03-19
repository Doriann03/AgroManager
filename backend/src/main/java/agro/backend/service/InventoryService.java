package agro.backend.service;

import agro.backend.model.InventoryItem;
import agro.backend.model.User;
import agro.backend.repository.InventoryItemRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository;

    public List<InventoryItem> getInventoryByUsername(String username) {
        return inventoryItemRepository.findAllByOwnerUsername(username);
    }

    public InventoryItem saveItem(InventoryItem item, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        item.setOwner(owner);
        return inventoryItemRepository.save(item);
    }
    
    public InventoryItem updateItem(Long id, InventoryItem updatedItem, String username) {
        InventoryItem existingItem = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu a fost găsit"));

        if (!existingItem.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("Nu aveți permisiunea să modificați acest produs.");
        }

        existingItem.setName(updatedItem.getName());
        existingItem.setCategory(updatedItem.getCategory());
        existingItem.setUnitOfMeasure(updatedItem.getUnitOfMeasure());
        existingItem.setQuantityAvailable(updatedItem.getQuantityAvailable());
        existingItem.setUnitPrice(updatedItem.getUnitPrice());

        return inventoryItemRepository.save(existingItem);
    }
    
    public void deleteItem(Long id) {
        inventoryItemRepository.deleteById(id);
    }
}