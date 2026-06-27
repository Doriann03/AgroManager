package agro.backend.service;

import agro.backend.model.InventoryItem;
import agro.backend.model.User;
import agro.backend.model.dto.InventoryItemRequestDTO;
import agro.backend.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    public List<InventoryItem> getInventoryByFarm(Long farmId) {
        return inventoryItemRepository.findAllByFarmId(farmId);
    }

    public InventoryItem saveItem(InventoryItemRequestDTO request, User user) {
        if (user.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio ferma.");
        }
        InventoryItem item = new InventoryItem();
        applyRequest(item, request);
        item.setFarm(user.getFarm());
        return inventoryItemRepository.save(item);
    }

    public InventoryItem updateItem(Long id, InventoryItemRequestDTO request, User user) {
        InventoryItem existingItem = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu a fost gasit"));

        if (user.getFarm() == null || !existingItem.getFarm().getId().equals(user.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea sa modificati acest produs.");
        }

        applyRequest(existingItem, request);

        return inventoryItemRepository.save(existingItem);
    }

    public void deleteItem(Long id, User user) {
        InventoryItem existingItem = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produsul nu a fost gasit"));

        if (user.getFarm() == null || !existingItem.getFarm().getId().equals(user.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea sa stergeti acest produs.");
        }

        inventoryItemRepository.delete(existingItem);
    }

    private void applyRequest(InventoryItem item, InventoryItemRequestDTO request) {
        item.setName(request.getName().trim());
        item.setCategory(request.getCategory());
        item.setUnitOfMeasure(request.getUnitOfMeasure().trim());
        item.setQuantityAvailable(request.getQuantityAvailable());
        item.setUnitPrice(request.getUnitPrice());
    }
}
