package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityConsumption;
import agro.backend.model.InventoryItem;
import agro.backend.model.Machinery;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.dto.ActivityRequestDTO;
import agro.backend.model.dto.ConsumptionRequestDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.InventoryItemRepository;
import agro.backend.repository.MachineryRepository;
import agro.backend.repository.ParcelRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ParcelRepository parcelRepository;
    private final MachineryRepository machineryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository;

    public List<Activity> getActivitiesByParcelId(Long parcelId) {
        return activityRepository.findByParcelId(parcelId);
    }

    public List<Activity> getActivitiesByWorkerId(Long workerId) {
        return activityRepository.findByAssignedWorkers_Id(workerId);
    }

    @Transactional
    public Activity createActivity(ActivityRequestDTO dto, User currentUser) {
        if (currentUser.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio fermă.");
        }
        Long userFarmId = currentUser.getFarm().getId();

        // Găsim parcela și verificăm apartenența la fermă
        Parcel parcel = parcelRepository.findById(dto.getParcelId())
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost găsită"));
        
        if (!parcel.getFarm().getId().equals(userFarmId)) {
            throw new RuntimeException("Parcela nu aparține fermei curente.");
        }

        // Găsim utilajele și verificăm apartenența la fermă
        Set<Machinery> selectedMachineries = new HashSet<>();
        if (dto.getMachineryIds() != null && !dto.getMachineryIds().isEmpty()) {
            List<Machinery> machineries = machineryRepository.findAllById(dto.getMachineryIds());
            for (Machinery m : machineries) {
                 if (!m.getFarm().getId().equals(userFarmId)) {
                     throw new RuntimeException("Un utilaj selectat nu aparține fermei curente!");
                 }
            }
            selectedMachineries.addAll(machineries);
        }

        // Creăm activitatea
        Activity activity = new Activity();
        activity.setTitle(dto.getTitle());
        activity.setStartDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDateTime.now()); 
        activity.setParcel(parcel);
        activity.setMachineries(selectedMachineries);
        
        Set<User> assignedWorkers = new HashSet<>();
        if (dto.getAssignedWorkerIds() != null && !dto.getAssignedWorkerIds().isEmpty()) {
            List<User> workers = userRepository.findAllById(dto.getAssignedWorkerIds());
            for (User w : workers) {
                if (w.getFarm() == null || !w.getFarm().getId().equals(userFarmId)) {
                    throw new RuntimeException("Un muncitor selectat nu aparține fermei curente!");
                }
            }
            assignedWorkers.addAll(workers);
        }
        activity.setAssignedWorkers(assignedWorkers);

        // Logica pentru consumuri și stocuri
        if (dto.getConsumptions() != null && !dto.getConsumptions().isEmpty()) {
            for (ConsumptionRequestDTO consDto : dto.getConsumptions()) {
                InventoryItem item = inventoryItemRepository.findById(consDto.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Produsul din magazie nu a fost găsit."));
                    
                if (!item.getFarm().getId().equals(userFarmId)) {
                     throw new RuntimeException("Produsul selectat nu aparține fermei curente!");
                }
                
                if (item.getQuantityAvailable() < consDto.getQuantityUsed()) {
                    throw new RuntimeException("Stoc insuficient pentru: " + item.getName() + 
                                               ". Disponibil: " + item.getQuantityAvailable() + item.getUnitOfMeasure());
                }
                
                // Scădem stocul
                item.setQuantityAvailable(item.getQuantityAvailable() - consDto.getQuantityUsed());
                inventoryItemRepository.save(item); // Salvăm modificarea stocului
                
                // Creăm înregistrarea de consum
                ActivityConsumption consumption = new ActivityConsumption();
                consumption.setActivity(activity);
                consumption.setInventoryItem(item);
                consumption.setQuantityUsed(consDto.getQuantityUsed());
                
                activity.getConsumptions().add(consumption);
            }
        }

        return activityRepository.save(activity);
    }
}