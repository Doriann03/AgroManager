package agro.backend.service;

import agro.backend.model.InventoryItem;
import agro.backend.model.InventoryRequest;
import agro.backend.model.RequestStatus;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.repository.InventoryItemRepository;
import agro.backend.repository.InventoryRequestRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryRequestService {

    private final InventoryRequestRepository inventoryRequestRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public List<InventoryRequest> getFarmRequests(User user) {
        if (user.getFarm() == null) throw new RuntimeException("Nu sunteti asociat unei ferme.");
        return inventoryRequestRepository.findByFarmIdOrderByDateCreatedDesc(user.getFarm().getId());
    }

    @Transactional
    public InventoryRequest createRequest(InventoryRequest request, User requester) {
        if (requester.getFarm() == null) throw new RuntimeException("Nu sunteti asociat unei ferme.");
        
        request.setRequester(requester);
        request.setFarm(requester.getFarm());
        request.setStatus(RequestStatus.PENDING);
        
        InventoryRequest saved = inventoryRequestRepository.save(request);
        
        // Notificam Managerii
        List<User> managers = userRepository.findByFarmIdAndRoleIn(
            requester.getFarm().getId(), 
            Arrays.asList(UserRole.FARM_MANAGER)
        );
        
        String message = String.format("Nouă cerere de aprovizionare: %s (%s %s) trimisă de %s.", 
                saved.getItemName(), saved.getQuantityRequested(), saved.getUnitOfMeasure(), requester.getUsername());
        
        for (User m : managers) {
            notificationService.createNotification(m, message, "INVENTORY_REQUEST");
        }
        
        return saved;
    }

    @Transactional
    public InventoryRequest updateRequestStatus(Long requestId, String newStatus, User manager) {
        InventoryRequest request = inventoryRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Cererea nu a fost găsită."));
                
        if (!request.getFarm().getId().equals(manager.getFarm().getId())) {
            throw new RuntimeException("Nu aveți permisiunea de a modifica această cerere.");
        }

        RequestStatus status = RequestStatus.valueOf(newStatus.toUpperCase());
        request.setStatus(status);
        
        InventoryRequest updated = inventoryRequestRepository.save(request);

        // LOGICA AUTOMATA: Daca este aprobata, adaugam in magazie
        if (status == RequestStatus.APPROVED) {
            inventoryItemRepository.findByFarmIdAndNameIgnoreCase(request.getFarm().getId(), request.getItemName())
                .ifPresentOrElse(item -> {
                    // Actualizam stocul existent
                    double current = item.getQuantityAvailable() != null ? item.getQuantityAvailable() : 0;
                    item.setQuantityAvailable(current + request.getQuantityRequested());
                    inventoryItemRepository.save(item);
                }, () -> {
                    // Cream produs nou in magazie
                    InventoryItem newItem = new InventoryItem();
                    newItem.setName(request.getItemName());
                    newItem.setCategory(request.getItemCategory());
                    newItem.setUnitOfMeasure(request.getUnitOfMeasure());
                    newItem.setQuantityAvailable(request.getQuantityRequested());
                    newItem.setUnitPrice(0.0); // Initial 0, managerul poate edita ulterior
                    newItem.setFarm(request.getFarm());
                    inventoryItemRepository.save(newItem);
                });
        }
        
        // Notificam agronomul (solicitantul) despre decizie
        String message = String.format("Cererea dumneavoastră pentru '%s' a fost %s de către manager. %s", 
                updated.getItemName(), 
                status == RequestStatus.APPROVED ? "APROBATĂ" : "RESPINSĂ",
                status == RequestStatus.APPROVED ? "Stocul a fost actualizat automat." : "");
        
        notificationService.createNotification(updated.getRequester(), message, "REQUEST_DECISION");
        
        return updated;
    }
}
