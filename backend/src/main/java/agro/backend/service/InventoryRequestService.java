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
        if (user.getFarm() == null) {
            throw new RuntimeException("Nu sunteti asociat unei ferme.");
        }
        return inventoryRequestRepository.findByFarmIdOrderByDateCreatedDesc(user.getFarm().getId());
    }

    @Transactional
    public InventoryRequest createRequest(InventoryRequest request, User requester) {
        if (requester.getFarm() == null) {
            throw new RuntimeException("Nu sunteti asociat unei ferme.");
        }

        request.setRequester(requester);
        request.setFarm(requester.getFarm());
        request.setStatus(RequestStatus.PENDING);

        InventoryRequest saved = inventoryRequestRepository.save(request);

        List<User> managers = userRepository.findByFarmIdAndRoleIn(
                requester.getFarm().getId(),
                Arrays.asList(UserRole.FARM_MANAGER)
        );

        String message = String.format("Noua cerere de aprovizionare: %s (%s %s) trimisa de %s.",
                saved.getItemName(), saved.getQuantityRequested(), saved.getUnitOfMeasure(), requester.getUsername());

        for (User manager : managers) {
            notificationService.createNotification(manager, message, "INVENTORY_REQUEST");
        }

        return saved;
    }

    @Transactional
    public InventoryRequest updateRequestStatus(Long requestId, String newStatus, User manager) {
        InventoryRequest request = inventoryRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Cererea nu a fost gasita."));

        if (!request.getFarm().getId().equals(manager.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea de a modifica aceasta cerere.");
        }

        RequestStatus status = RequestStatus.valueOf(newStatus.toUpperCase());
        request.setStatus(status);

        InventoryRequest updated = inventoryRequestRepository.save(request);

        // Cererile aprobate actualizeaza automat magazia fermei.
        if (status == RequestStatus.APPROVED) {
            inventoryItemRepository.findByFarmIdAndNameIgnoreCase(request.getFarm().getId(), request.getItemName())
                    .ifPresentOrElse(item -> {
                        double current = item.getQuantityAvailable() != null ? item.getQuantityAvailable() : 0;
                        item.setQuantityAvailable(current + request.getQuantityRequested());
                        inventoryItemRepository.save(item);
                    }, () -> {
                        InventoryItem newItem = new InventoryItem();
                        newItem.setName(request.getItemName());
                        newItem.setCategory(request.getItemCategory());
                        newItem.setUnitOfMeasure(request.getUnitOfMeasure());
                        newItem.setQuantityAvailable(request.getQuantityRequested());
                        newItem.setUnitPrice(0.0);
                        newItem.setFarm(request.getFarm());
                        inventoryItemRepository.save(newItem);
                    });
        }

        String message = String.format("Cererea dumneavoastra pentru '%s' a fost %s de catre manager. %s",
                updated.getItemName(),
                status == RequestStatus.APPROVED ? "APROBATA" : "RESPINSA",
                status == RequestStatus.APPROVED ? "Stocul a fost actualizat automat." : "");

        notificationService.createNotification(updated.getRequester(), message, "REQUEST_DECISION");

        return updated;
    }
}
