package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityConsumption;
import agro.backend.model.InventoryItem;
import agro.backend.model.Machinery;
import agro.backend.model.Parcel;
import agro.backend.model.dto.ActivityRequestDTO;
import agro.backend.model.dto.ConsumptionRequestDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.InventoryItemRepository;
import agro.backend.repository.MachineryRepository;
import agro.backend.repository.ParcelRepository;
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

    public List<Activity> getActivitiesByParcelId(Long parcelId) {
        return activityRepository.findByParcelId(parcelId);
    }

    @Transactional // Foarte important: folosim tranzacție pentru a asigura consistența datelor (dacă scade stocul, activitatea trebuie salvată)
    public Activity createActivity(ActivityRequestDTO dto, String username) {
        // Găsim parcela și verificăm apartenența
        Parcel parcel = parcelRepository.findById(dto.getParcelId())
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost găsită"));
        
        if (!parcel.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("Nu sunteți proprietarul acestei parcele");
        }

        // Găsim utilajele
        Set<Machinery> selectedMachineries = new HashSet<>();
        if (dto.getMachineryIds() != null && !dto.getMachineryIds().isEmpty()) {
            List<Machinery> machineries = machineryRepository.findAllById(dto.getMachineryIds());
            for (Machinery m : machineries) {
                 if (!m.getOwner().getUsername().equals(username)) {
                     throw new RuntimeException("Un utilaj selectat nu vă aparține!");
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
        
        // Logica pentru consumuri și stocuri
        if (dto.getConsumptions() != null && !dto.getConsumptions().isEmpty()) {
            for (ConsumptionRequestDTO consDto : dto.getConsumptions()) {
                InventoryItem item = inventoryItemRepository.findById(consDto.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Produsul din magazie nu a fost găsit."));
                    
                if (!item.getOwner().getUsername().equals(username)) {
                     throw new RuntimeException("Produsul selectat nu vă aparține!");
                }
                
                if (item.getQuantityAvailable() < consDto.getQuantityUsed()) {
                    throw new RuntimeException("Stoc insuficient pentru: " + item.getName() + 
                                               ". Disponibil: " + item.getQuantityAvailable());
                }
                
                // Scădem stocul
                item.setQuantityAvailable(item.getQuantityAvailable() - consDto.getQuantityUsed());
                inventoryItemRepository.save(item);
                
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