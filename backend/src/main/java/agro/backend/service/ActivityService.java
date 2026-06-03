package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityConsumption;
import agro.backend.model.ActivityType;
import agro.backend.model.CropSeason;
import agro.backend.model.InventoryItem;
import agro.backend.model.Machinery;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.dto.ActivityRequestDTO;
import agro.backend.model.dto.ConsumptionRequestDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.CropSeasonRepository;
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
    private final CropSeasonRepository cropSeasonRepository;

    public List<Activity> getActivitiesByParcelId(Long parcelId) {
        return activityRepository.findByParcelId(parcelId);
    }

    public List<Activity> getActivitiesByWorkerId(Long workerId) {
        return activityRepository.findByAssignedWorkers_Id(workerId);
    }

    public List<Activity> getActivitiesByFarmId(Long farmId) {
        return activityRepository.findByParcel_Farm_IdOrderByStartDateDesc(farmId);
    }

    private java.time.LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            if (dateStr.length() == 16) { // Format: yyyy-MM-ddTHH:mm
                return java.time.LocalDateTime.parse(dateStr, java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
            }
            return java.time.LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            throw new RuntimeException("Format data invalid: " + dateStr);
        }
    }

    @Transactional
    public Activity updateActivityStatus(Long activityId, String newStatus, String startDateStr, String endDateStr, String comments, Double harvestedYieldKg, User currentUser) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activitatea nu a fost găsită."));
                
        boolean isAssigned = activity.getAssignedWorkers().stream()
                .anyMatch(worker -> worker.getId().equals(currentUser.getId()));
                
        if (!isAssigned) {
            throw new RuntimeException("Nu aveți permisiunea de a modifica această activitate.");
        }

        try {
            agro.backend.model.ActivityStatus status = agro.backend.model.ActivityStatus.valueOf(newStatus.toUpperCase());
            activity.setStatus(status);
            
            if (startDateStr != null && !startDateStr.isEmpty()) activity.setStartDate(parseDateTime(startDateStr));
            if (endDateStr != null && !endDateStr.isEmpty()) activity.setEndDate(parseDateTime(endDateStr));
            if (comments != null) activity.setComments(comments);
            if (harvestedYieldKg != null) activity.setHarvestedYieldKg(harvestedYieldKg);

            // LOGICA SINCRONIZARE RECOLTA (RECOLTAT -> CropSeason)
            if (activity.getType() == ActivityType.RECOLTAT && status == agro.backend.model.ActivityStatus.COMPLETED && harvestedYieldKg != null && harvestedYieldKg > 0) {
                
                // 1. Determinam anul (prioritate data sfarsit -> data inceput -> acum)
                int syncYear = java.time.LocalDateTime.now().getYear();
                if (activity.getEndDate() != null) syncYear = activity.getEndDate().getYear();
                else if (activity.getStartDate() != null) syncYear = activity.getStartDate().getYear();
                
                final int yearToUse = syncYear;
                
                // 2. Obtinem parcela (fresh din DB pentru a evita proxy issues)
                Parcel parcel = parcelRepository.findById(activity.getParcel().getId())
                        .orElseThrow(() -> new RuntimeException("Parcela asociată nu a fost găsită."));
                
                System.out.println(">>> SYNC: Incepere proces pentru parcela " + parcel.getName() + " in anul " + yearToUse + " cu yield: " + harvestedYieldKg);

                // 3. Cautam sau cream sezonul
                java.util.Optional<CropSeason> existingSeason = cropSeasonRepository.findByParcelIdAndHarvestYear(parcel.getId(), yearToUse);
                
                if (existingSeason.isPresent()) {
                    CropSeason s = existingSeason.get();
                    double oldYield = s.getTotalYieldKg() != null ? s.getTotalYieldKg() : 0;
                    s.setTotalYieldKg(oldYield + harvestedYieldKg);
                    cropSeasonRepository.save(s);
                    System.out.println(">>> SYNC: Actualizat sezon existent (ID: " + s.getId() + "). Noua recolta: " + s.getTotalYieldKg());
                } else {
                    CropSeason newSeason = new CropSeason();
                    newSeason.setParcel(parcel);
                    newSeason.setHarvestYear(yearToUse);
                    newSeason.setCropType(parcel.getCropType() != null ? parcel.getCropType() : "Nespecificat");
                    newSeason.setTotalYieldKg(harvestedYieldKg);
                    cropSeasonRepository.save(newSeason);
                    System.out.println(">>> SYNC: Creat sezon NOU pentru " + yearToUse + ". Recolta: " + harvestedYieldKg);
                }
            }

            return activityRepository.save(activity);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Status invalid: " + newStatus);
        }
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
        activity.setType(dto.getType() != null ? dto.getType() : ActivityType.ALTELE);
        activity.setStartDate(dto.getStartDate()); 
        activity.setParcel(parcel);
        activity.setMachineries(selectedMachineries);
        
        Set<User> assignedWorkers = new HashSet<>();
        if (dto.getAssignedWorkerIds() == null || dto.getAssignedWorkerIds().isEmpty()) {
            throw new RuntimeException("Trebuie sa selectati cel putin un muncitor pentru aceasta lucrare.");
        }
        
        List<User> workers = userRepository.findAllById(dto.getAssignedWorkerIds());
        for (User w : workers) {
            if (w.getFarm() == null || !w.getFarm().getId().equals(userFarmId)) {
                throw new RuntimeException("Un muncitor selectat nu aparține fermei curente!");
            }
        }
        assignedWorkers.addAll(workers);
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