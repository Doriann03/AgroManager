package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityConsumption;
import agro.backend.model.ActivityType;
import agro.backend.model.CropSeason;
import agro.backend.model.InventoryItem;
import agro.backend.model.Machinery;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.UserRole;
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
import java.util.Arrays;
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
    private final NotificationService notificationService;

    public List<Activity> getActivitiesByParcelId(Long parcelId, User currentUser) {
        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost gasita."));

        if (currentUser.getFarm() == null || !parcel.getFarm().getId().equals(currentUser.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea de a vedea activitatile acestei parcele.");
        }

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
    public Activity updateActivityStatus(
            Long activityId,
            String newStatus,
            String startDateStr,
            String endDateStr,
            String comments,
            Double harvestedYieldKg,
            List<ConsumptionRequestDTO> actualConsumptions,
            User currentUser) {
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
            
            // LOGICA AUTOMATA PENTRU STATUSUL UTILAJELOR
            if (status == agro.backend.model.ActivityStatus.IN_PROGRESS) {
                activity.getMachineries().forEach(m -> {
                    m.setStatus(agro.backend.model.MachineryStatus.IN_CURSA);
                    machineryRepository.save(m);
                });
            } else if (status == agro.backend.model.ActivityStatus.COMPLETED) {
                activity.getMachineries().forEach(m -> {
                    m.setStatus(agro.backend.model.MachineryStatus.DISPONIBIL);
                    machineryRepository.save(m);
                });
            }

            if (startDateStr != null && !startDateStr.isEmpty()) activity.setStartDate(parseDateTime(startDateStr));
            if (endDateStr != null && !endDateStr.isEmpty()) activity.setEndDate(parseDateTime(endDateStr));
            if (comments != null) activity.setComments(comments);
            if (harvestedYieldKg != null) activity.setHarvestedYieldKg(harvestedYieldKg);

            if (status == agro.backend.model.ActivityStatus.COMPLETED) {
                applyActualConsumptions(activity, actualConsumptions, currentUser);
                deductInventoryForCompletedActivity(activity);
            }

            // LOGICA AUTOMATA PENTRU ORELE DE FUNCTIONARE
            if (status == agro.backend.model.ActivityStatus.COMPLETED && activity.getStartDate() != null && activity.getEndDate() != null) {
                long durationHours = java.time.Duration.between(activity.getStartDate(), activity.getEndDate()).toHours();
                if (durationHours > 0) {
                    activity.getMachineries().forEach(m -> {
                        int currentHours = m.getTotalHours() != null ? m.getTotalHours() : 0;
                        m.setTotalHours(currentHours + (int)durationHours);
                        machineryRepository.save(m);
                    });
                }
            }

            // LOGICA SINCRONIZARE RECOLTA (RECOLTAT -> CropSeason)
            if (activity.getType() == ActivityType.RECOLTAT && status == agro.backend.model.ActivityStatus.COMPLETED && harvestedYieldKg != null && harvestedYieldKg > 0) {
                
                int syncYear = java.time.LocalDateTime.now().getYear();
                if (activity.getEndDate() != null) syncYear = activity.getEndDate().getYear();
                else if (activity.getStartDate() != null) syncYear = activity.getStartDate().getYear();
                
                final int yearToUse = syncYear;
                Parcel parcel = parcelRepository.findById(activity.getParcel().getId())
                        .orElseThrow(() -> new RuntimeException("Parcela asociată nu a fost găsită."));
                
                cropSeasonRepository.findByParcelIdAndHarvestYear(parcel.getId(), yearToUse)
                    .ifPresentOrElse(season -> {
                        double currentYield = season.getTotalYieldKg() != null ? season.getTotalYieldKg() : 0;
                        season.setTotalYieldKg(currentYield + harvestedYieldKg);
                        cropSeasonRepository.save(season);
                    }, () -> {
                        CropSeason newSeason = new CropSeason();
                        newSeason.setParcel(parcel);
                        newSeason.setHarvestYear(yearToUse);
                        newSeason.setCropType(parcel.getCropType() != null ? parcel.getCropType() : "Nespecificat");
                        newSeason.setTotalYieldKg(harvestedYieldKg);
                        cropSeasonRepository.save(newSeason);
                    });
            }

            // TRIGGER NOTIFICARI pentru Agronomi si Manageri
            if (status == agro.backend.model.ActivityStatus.COMPLETED) {
                Parcel parcel = parcelRepository.findById(activity.getParcel().getId()).orElse(null);
                if (parcel != null && parcel.getFarm() != null) {
                    Long farmId = parcel.getFarm().getId();
                    List<User> recipients = userRepository.findByFarmIdAndRoleIn(
                        farmId, 
                        Arrays.asList(UserRole.AGRONOMIST, UserRole.FARM_MANAGER)
                    );
                    
                    String typeLabel = activity.getType() != null ? activity.getType().toString() : "Activitate";
                    String message = String.format("Lucrarea '%s' a fost finalizată pe parcela %s de către %s.", 
                            typeLabel, parcel.getName(), currentUser.getUsername());
                    
                    for (User recipient : recipients) {
                        notificationService.createNotification(recipient, message, "TASK_COMPLETED");
                    }
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

        Parcel parcel = parcelRepository.findById(dto.getParcelId())
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost găsită"));
        
        if (!parcel.getFarm().getId().equals(userFarmId)) {
            throw new RuntimeException("Parcela nu aparține fermei curente.");
        }

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

        Activity activity = new Activity();
        activity.setTitle(dto.getTitle());
        activity.setType(dto.getType() != null ? dto.getType() : ActivityType.ALTELE);
        activity.setStartDate(dto.getStartDate()); 
        activity.setParcel(parcel);
        activity.setMachineries(selectedMachineries);
        activity.setInventoryDeducted(false);
        
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

        if (dto.getConsumptions() != null && !dto.getConsumptions().isEmpty()) {
            for (ConsumptionRequestDTO consDto : dto.getConsumptions()) {
                InventoryItem item = inventoryItemRepository.findById(consDto.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Produsul din magazie nu a fost găsit."));
                    
                if (!item.getFarm().getId().equals(userFarmId)) {
                     throw new RuntimeException("Produsul selectat nu aparține fermei curente!");
                }
                
                ActivityConsumption consumption = new ActivityConsumption();
                consumption.setActivity(activity);
                consumption.setInventoryItem(item);
                consumption.setQuantityUsed(consDto.getQuantityUsed());
                
                activity.getConsumptions().add(consumption);
            }
        }

        return activityRepository.save(activity);
    }

    private void applyActualConsumptions(Activity activity, List<ConsumptionRequestDTO> actualConsumptions, User currentUser) {
        if (actualConsumptions == null) {
            return;
        }

        if (activity.getConsumptions().isEmpty() && actualConsumptions.isEmpty()) {
            return;
        }

        if (activity.getConsumptions().size() != actualConsumptions.size()) {
            throw new RuntimeException("Trebuie raportata cantitatea reala pentru fiecare consumabil planificat.");
        }

        Set<Long> reportedConsumptionIds = new HashSet<>();
        Set<Long> reportedItemIds = new HashSet<>();
        Long currentFarmId = currentUser.getFarm() != null ? currentUser.getFarm().getId() : null;

        for (ConsumptionRequestDTO actualConsumption : actualConsumptions) {
            ActivityConsumption plannedConsumption = findPlannedConsumption(
                    activity,
                    actualConsumption,
                    reportedConsumptionIds,
                    reportedItemIds);

            InventoryItem item = inventoryItemRepository.findById(actualConsumption.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Produsul din magazie nu a fost gasit."));

            if (currentFarmId == null || item.getFarm() == null || !item.getFarm().getId().equals(currentFarmId)) {
                throw new RuntimeException("Produsul raportat nu apartine fermei curente.");
            }

            plannedConsumption.setQuantityUsed(actualConsumption.getQuantityUsed());
        }
    }

    private ActivityConsumption findPlannedConsumption(
            Activity activity,
            ConsumptionRequestDTO actualConsumption,
            Set<Long> reportedConsumptionIds,
            Set<Long> reportedItemIds) {
        if (actualConsumption.getActivityConsumptionId() != null) {
            if (!reportedConsumptionIds.add(actualConsumption.getActivityConsumptionId())) {
                throw new RuntimeException("Acelasi consumabil a fost raportat de mai multe ori.");
            }

            return activity.getConsumptions().stream()
                    .filter(consumption -> actualConsumption.getActivityConsumptionId().equals(consumption.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Consumabilul raportat nu face parte din lucrarea planificata."));
        }

        if (!reportedItemIds.add(actualConsumption.getInventoryItemId())) {
            throw new RuntimeException("Acelasi consumabil a fost raportat de mai multe ori.");
        }

        List<ActivityConsumption> matches = activity.getConsumptions().stream()
                .filter(consumption -> actualConsumption.getInventoryItemId().equals(consumption.getInventoryItem().getId()))
                .toList();

        if (matches.size() != 1) {
            throw new RuntimeException("Consumabilul raportat nu face parte din lucrarea planificata.");
        }

        return matches.get(0);
    }

    private void deductInventoryForCompletedActivity(Activity activity) {
        if (!Boolean.FALSE.equals(activity.getInventoryDeducted())) {
            return;
        }

        for (ActivityConsumption consumption : activity.getConsumptions()) {
            InventoryItem item = inventoryItemRepository.findById(consumption.getInventoryItem().getId())
                    .orElseThrow(() -> new RuntimeException("Produsul din magazie nu a fost gasit."));

            Double quantityUsed = consumption.getQuantityUsed();
            if (quantityUsed == null || quantityUsed <= 0) {
                throw new RuntimeException("Cantitatea consumata trebuie sa fie mai mare decat 0.");
            }

            double availableQuantity = item.getQuantityAvailable() != null ? item.getQuantityAvailable() : 0;
            if (availableQuantity < quantityUsed) {
                throw new RuntimeException("Stoc insuficient pentru: " + item.getName()
                        + ". Disponibil: " + availableQuantity + item.getUnitOfMeasure());
            }

            double remainingQuantity = availableQuantity - quantityUsed;
            item.setQuantityAvailable(remainingQuantity);
            inventoryItemRepository.save(item);
            notifyManagersIfLowStockThresholdReached(item, availableQuantity, remainingQuantity);
        }

        activity.setInventoryDeducted(true);
    }

    private void notifyManagersIfLowStockThresholdReached(InventoryItem item, double previousQuantity, double currentQuantity) {
        Double threshold = item.getMinimumStockThreshold();
        if (threshold == null || previousQuantity <= threshold || currentQuantity > threshold) {
            return;
        }

        if (item.getFarm() == null) {
            return;
        }

        String unit = item.getUnitOfMeasure() != null ? item.getUnitOfMeasure() : "";
        String message = String.format(
                "Stoc redus pentru %s: %.2f %s ramase. Prag minim: %.2f %s.",
                item.getName(),
                currentQuantity,
                unit,
                threshold,
                unit);

        List<User> managers = userRepository.findByFarmIdAndRoleIn(
                item.getFarm().getId(),
                Arrays.asList(UserRole.FARM_MANAGER));

        for (User manager : managers) {
            notificationService.createNotification(manager, message, "LOW_STOCK");
        }
    }
}
