package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.AuditLog;
import agro.backend.model.CropSeason;
import agro.backend.model.Farm;
import agro.backend.model.InventoryItem;
import agro.backend.model.InventoryRequest;
import agro.backend.model.ItemCategory;
import agro.backend.model.Machinery;
import agro.backend.model.MachineryStatus;
import agro.backend.model.MachineryType;
import agro.backend.model.MaintenanceLog;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.AdminAuditLogDTO;
import agro.backend.model.dto.AdminFarmDTO;
import agro.backend.model.dto.AdminFarmUpdateRequestDTO;
import agro.backend.model.dto.AdminManagedEntityDTO;
import agro.backend.model.dto.AdminManagedEntityUpdateRequestDTO;
import agro.backend.model.dto.AdminStatsDTO;
import agro.backend.model.dto.AdminUserDTO;
import agro.backend.model.dto.AdminUserUpdateRequestDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.AuditLogRepository;
import agro.backend.repository.CropSeasonRepository;
import agro.backend.repository.FarmRepository;
import agro.backend.repository.InventoryItemRepository;
import agro.backend.repository.InventoryRequestRepository;
import agro.backend.repository.MachineryRepository;
import agro.backend.repository.MaintenanceLogRepository;
import agro.backend.repository.ParcelRepository;
import agro.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final ParcelRepository parcelRepository;
    private final ActivityRepository activityRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryRequestRepository inventoryRequestRepository;
    private final MachineryRepository machineryRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final CropSeasonRepository cropSeasonRepository;
    private final AuditLogRepository auditLogRepository;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public AdminStatsDTO getStats() {
        List<Farm> farms = farmRepository.findAll();
        List<User> users = userRepository.findAll();
        List<Parcel> parcels = parcelRepository.findAll();

        AdminStatsDTO stats = new AdminStatsDTO();
        stats.setTotalFarms(farms.size());
        stats.setTotalUsers(users.size());
        stats.setManagers(countRole(users, UserRole.FARM_MANAGER));
        stats.setAgronomists(countRole(users, UserRole.AGRONOMIST));
        stats.setWorkers(countRole(users, UserRole.WORKER));
        stats.setSuperAdmins(countRole(users, UserRole.SUPER_ADMIN));
        stats.setTotalParcels(parcels.size());
        stats.setRecentFarms(getFarms().stream().limit(5).toList());
        return stats;
    }

    @Transactional(readOnly = true)
    public List<AdminFarmDTO> getFarms() {
        List<User> users = userRepository.findAll();
        List<Parcel> parcels = parcelRepository.findAll();
        Map<Long, Long> usersByFarmId = users.stream()
                .filter(user -> user.getFarm() != null)
                .collect(Collectors.groupingBy(user -> user.getFarm().getId(), Collectors.counting()));
        Map<Long, Long> parcelsByFarmId = parcels.stream()
                .filter(parcel -> parcel.getFarm() != null)
                .collect(Collectors.groupingBy(parcel -> parcel.getFarm().getId(), Collectors.counting()));

        return farmRepository.findAll().stream()
                .sorted(Comparator.comparing(Farm::getId, Comparator.nullsLast(Long::compareTo)).reversed())
                .map(farm -> mapFarm(farm, usersByFarmId, parcelsByFarmId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminUserDTO> getUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getUsername, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(this::mapUser)
                .toList();
    }

    @Transactional
    public AdminFarmDTO updateFarm(Long farmId, AdminFarmUpdateRequestDTO request, String actorUsername) {
        if (request == null) {
            throw new RuntimeException("Datele fermei sunt obligatorii.");
        }

        User actor = findUser(actorUsername);
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Ferma nu a fost gasita."));

        String name = requiredText(request.getName(), "Numele fermei este obligatoriu.");
        farmRepository.findByName(name)
                .filter(existingFarm -> !existingFarm.getId().equals(farmId))
                .ifPresent(existingFarm -> {
                    throw new RuntimeException("Exista deja o ferma cu acest nume.");
                });

        farm.setName(name);
        farm.setAddress(cleanNullable(request.getAddress()));
        farm.setContactEmail(cleanNullable(request.getContactEmail()));
        Farm savedFarm = farmRepository.save(farm);

        createAuditLog(
                actor,
                "FARM_UPDATED",
                "FARM",
                savedFarm.getId(),
                savedFarm.getName(),
                "Datele fermei au fost actualizate controlat din panoul Super Admin.");

        Map<Long, Long> usersByFarmId = userRepository.findAll().stream()
                .filter(user -> user.getFarm() != null)
                .collect(Collectors.groupingBy(user -> user.getFarm().getId(), Collectors.counting()));
        Map<Long, Long> parcelsByFarmId = parcelRepository.findAll().stream()
                .filter(parcel -> parcel.getFarm() != null)
                .collect(Collectors.groupingBy(parcel -> parcel.getFarm().getId(), Collectors.counting()));
        return mapFarm(savedFarm, usersByFarmId, parcelsByFarmId);
    }

    @Transactional
    public AdminUserDTO updateUser(Long userId, AdminUserUpdateRequestDTO request, String actorUsername) {
        if (request == null) {
            throw new RuntimeException("Datele utilizatorului sunt obligatorii.");
        }

        User actor = findUser(actorUsername);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        String username = requiredText(request.getUsername(), "Numele utilizatorului este obligatoriu.");
        UserRole role = request.getRole() != null ? request.getRole() : user.getRole();

        userRepository.findByUsername(username)
                .filter(existingUser -> !existingUser.getId().equals(userId))
                .ifPresent(existingUser -> {
                    throw new RuntimeException("Exista deja un utilizator cu acest nume.");
                });

        if (user.getId().equals(actor.getId()) && role != UserRole.SUPER_ADMIN) {
            throw new RuntimeException("Nu iti poti elimina singur rolul de Super Admin.");
        }

        user.setUsername(username);
        user.setEmail(cleanNullable(request.getEmail()));
        user.setRole(role);
        if (role == UserRole.SUPER_ADMIN) {
            user.setFarm(null);
        } else {
            Long farmId = request.getFarmId();
            if (farmId == null) {
                throw new RuntimeException("Ferma este obligatorie pentru rolurile operationale.");
            }
            Farm farm = farmRepository.findById(farmId)
                    .orElseThrow(() -> new RuntimeException("Ferma selectata nu a fost gasita."));
            user.setFarm(farm);
        }

        User savedUser = userRepository.save(user);
        createAuditLog(
                actor,
                "USER_UPDATED",
                "USER",
                savedUser.getId(),
                savedUser.getUsername(),
                "Utilizator actualizat controlat din panoul Super Admin. Rol: " + savedUser.getRole());

        return mapUser(savedUser);
    }

    @Transactional(readOnly = true)
    public List<AdminManagedEntityDTO> getManagedEntities(String entityType) {
        String normalizedType = normalizeEntityType(entityType);

        return switch (normalizedType) {
            case "parcels" -> parcelRepository.findAll().stream()
                    .sorted(Comparator.comparing(Parcel::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                    .map(this::mapParcelEntity)
                    .toList();
            case "activities" -> activityRepository.findAll().stream()
                    .sorted(Comparator.comparing(this::activitySortKey, Comparator.nullsLast(java.time.LocalDateTime::compareTo)).reversed())
                    .map(this::mapActivityEntity)
                    .toList();
            case "inventory" -> inventoryItemRepository.findAll().stream()
                    .sorted(Comparator.comparing(InventoryItem::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                    .map(this::mapInventoryEntity)
                    .toList();
            case "requests" -> inventoryRequestRepository.findAll().stream()
                    .sorted(Comparator.comparing(InventoryRequest::getDateCreated, Comparator.nullsLast(java.time.LocalDateTime::compareTo)).reversed())
                    .map(this::mapInventoryRequestEntity)
                    .toList();
            case "machinery" -> machineryRepository.findAll().stream()
                    .sorted(Comparator.comparing(Machinery::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                    .map(this::mapMachineryEntity)
                    .toList();
            case "maintenance" -> maintenanceLogRepository.findAll().stream()
                    .sorted(Comparator.comparing(MaintenanceLog::getDate, Comparator.nullsLast(java.time.LocalDate::compareTo)).reversed())
                    .map(this::mapMaintenanceEntity)
                    .toList();
            case "crop-seasons" -> cropSeasonRepository.findAll().stream()
                    .sorted(Comparator.comparing(CropSeason::getHarvestYear, Comparator.nullsLast(Integer::compareTo)).reversed())
                    .map(this::mapCropSeasonEntity)
                    .toList();
            default -> throw new RuntimeException("Tip de entitate necunoscut.");
        };
    }

    @Transactional
    public void deleteUser(Long userId, String actorUsername) {
        User actor = findUser(actorUsername);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        if (user.getRole() == UserRole.SUPER_ADMIN && user.getId().equals(actor.getId())) {
            throw new RuntimeException("Nu iti poti sterge propriul cont de Super Admin.");
        }

        String username = user.getUsername();
        UserRole role = user.getRole();
        Long targetId = user.getId();

        transferOwnedFarmsBeforeUserDelete(targetId);
        deleteUserReferences(targetId);
        userRepository.delete(user);
        userRepository.flush();

        createAuditLog(
                actor,
                "USER_DELETED",
                "USER",
                targetId,
                username,
                "Utilizator sters definitiv. Rol: " + role);
    }

    @Transactional
    public void deleteFarm(Long farmId, String actorUsername) {
        User actor = findUser(actorUsername);
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Ferma nu a fost gasita."));

        String farmName = farm.getName();
        int usersCount = userRepository.findAllByFarmId(farmId).size();
        int parcelsCount = parcelRepository.findAllByFarmId(farmId).size();

        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
        try {
            deleteFarmReferences(farmId);
        } finally {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
        }

        createAuditLog(
                actor,
                "FARM_DELETED",
                "FARM",
                farmId,
                farmName,
                "Ferma stearsa definitiv impreuna cu " + usersCount + " utilizatori si " + parcelsCount + " parcele.");
    }

    @Transactional
    public void deleteManagedEntity(String entityType, Long entityId, String actorUsername) {
        User actor = findUser(actorUsername);
        String normalizedType = normalizeEntityType(entityType);
        AdminManagedEntityDTO snapshot = getManagedEntities(normalizedType).stream()
                .filter(entity -> entity.getId().equals(entityId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Entitatea nu a fost gasita."));

        switch (normalizedType) {
            case "parcels" -> deleteParcel(entityId);
            case "activities" -> deleteActivity(entityId);
            case "inventory" -> deleteInventoryItem(entityId);
            case "requests" -> deleteForEntity("delete from inventory_requests where id = :id", entityId);
            case "machinery" -> deleteMachinery(entityId);
            case "maintenance" -> deleteForEntity("delete from maintenance_logs where id = :id", entityId);
            case "crop-seasons" -> deleteForEntity("delete from crop_seasons where id = :id", entityId);
            default -> throw new RuntimeException("Tip de entitate necunoscut.");
        }

        createAuditLog(
                actor,
                "ENTITY_DELETED",
                normalizedType.toUpperCase(),
                entityId,
                snapshot.getName(),
                "Entitate stearsa controlat din panoul Super Admin. Ferma: " + nullSafe(snapshot.getFarmName()));
    }

    @Transactional
    public AdminManagedEntityDTO updateManagedEntity(
            String entityType,
            Long entityId,
            AdminManagedEntityUpdateRequestDTO request,
            String actorUsername) {
        User actor = findUser(actorUsername);
        String normalizedType = normalizeEntityType(entityType);
        AdminManagedEntityDTO updatedEntity = switch (normalizedType) {
            case "parcels" -> updateParcel(entityId, request);
            case "inventory" -> updateInventoryItem(entityId, request);
            case "machinery" -> updateMachinery(entityId, request);
            default -> throw new RuntimeException("Editarea este disponibila doar pentru ferme, utilizatori, parcele, utilaje si magazie.");
        };

        createAuditLog(
                actor,
                "ENTITY_UPDATED",
                normalizedType.toUpperCase(),
                updatedEntity.getId(),
                updatedEntity.getName(),
                "Entitate actualizata controlat din panoul Super Admin. Ferma: " + nullSafe(updatedEntity.getFarmName()));
        return updatedEntity;
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogDTO> getAuditLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(this::mapAuditLog)
                .toList();
    }

    private void deleteFarmReferences(Long farmId) {
        delete("delete from notifications where user_id in (select id from users where farm_id = :farmId)", farmId);
        delete("delete from inventory_requests where farm_id = :farmId", farmId);
        delete("delete from activity_consumptions where activity_id in (select id from activities where parcel_id in (select id from parcels where farm_id = :farmId))", farmId);
        delete("delete from activity_workers where activity_id in (select id from activities where parcel_id in (select id from parcels where farm_id = :farmId))", farmId);
        delete("delete from activity_machinery where activity_id in (select id from activities where parcel_id in (select id from parcels where farm_id = :farmId))", farmId);
        delete("delete from activities where parcel_id in (select id from parcels where farm_id = :farmId)", farmId);
        delete("delete from crop_seasons where parcel_id in (select id from parcels where farm_id = :farmId)", farmId);
        delete("delete from parcel_ndvi_history where parcel_id in (select id from parcels where farm_id = :farmId)", farmId);
        delete("delete from parcels where farm_id = :farmId", farmId);
        delete("delete from activity_machinery where machinery_id in (select id from machinery where farm_id = :farmId)", farmId);
        delete("delete from maintenance_logs where machinery_id in (select id from machinery where farm_id = :farmId)", farmId);
        delete("delete from machinery where farm_id = :farmId", farmId);
        delete("delete from activity_consumptions where inventory_item_id in (select id from inventory_items where farm_id = :farmId)", farmId);
        delete("delete from inventory_items where farm_id = :farmId", farmId);
        delete("delete from farm_notes where farm_id = :farmId", farmId);
        delete("delete from users where farm_id = :farmId", farmId);
        delete("delete from farms where id = :farmId", farmId);
    }

    private void transferOwnedFarmsBeforeUserDelete(Long userId) {
        @SuppressWarnings("unchecked")
        List<Number> ownedFarmIds = entityManager.createNativeQuery("select id from farms where created_by_user_id = :userId")
                .setParameter("userId", userId)
                .getResultList();

        for (Number farmIdNumber : ownedFarmIds) {
            Long farmId = farmIdNumber.longValue();
            @SuppressWarnings("unchecked")
            List<Number> replacementIds = entityManager.createNativeQuery("""
                            select id from users
                            where farm_id = :farmId and id <> :userId
                            order by case when role = 'FARM_MANAGER' then 0 else 1 end, id
                            limit 1
                            """)
                    .setParameter("farmId", farmId)
                    .setParameter("userId", userId)
                    .getResultList();

            if (replacementIds.isEmpty()) {
                throw new RuntimeException("Utilizatorul este singurul cont ramas pentru o ferma. Sterge mai intai ferma respectiva.");
            }

            entityManager.createNativeQuery("update farms set created_by_user_id = :replacementId where id = :farmId")
                    .setParameter("replacementId", replacementIds.get(0).longValue())
                    .setParameter("farmId", farmId)
                    .executeUpdate();
        }
    }

    private void deleteUserReferences(Long userId) {
        deleteForUser("delete from notifications where user_id = :userId", userId);
        deleteForUser("delete from inventory_requests where requester_id = :userId", userId);
        deleteForUser("delete from activity_workers where user_id = :userId", userId);
        deleteForUser("update farms set created_by_user_id = null where created_by_user_id = :userId", userId);
    }

    private void deleteParcel(Long parcelId) {
        deleteForEntity("delete from activity_consumptions where activity_id in (select id from activities where parcel_id = :id)", parcelId);
        deleteForEntity("delete from activity_workers where activity_id in (select id from activities where parcel_id = :id)", parcelId);
        deleteForEntity("delete from activity_machinery where activity_id in (select id from activities where parcel_id = :id)", parcelId);
        deleteForEntity("delete from activities where parcel_id = :id", parcelId);
        deleteForEntity("delete from crop_seasons where parcel_id = :id", parcelId);
        deleteForEntity("delete from parcel_ndvi_history where parcel_id = :id", parcelId);
        deleteForEntity("delete from parcels where id = :id", parcelId);
    }

    private void deleteActivity(Long activityId) {
        deleteForEntity("delete from activity_consumptions where activity_id = :id", activityId);
        deleteForEntity("delete from activity_workers where activity_id = :id", activityId);
        deleteForEntity("delete from activity_machinery where activity_id = :id", activityId);
        deleteForEntity("delete from activities where id = :id", activityId);
    }

    private void deleteInventoryItem(Long inventoryItemId) {
        deleteForEntity("delete from activity_consumptions where inventory_item_id = :id", inventoryItemId);
        deleteForEntity("delete from inventory_items where id = :id", inventoryItemId);
    }

    private void deleteMachinery(Long machineryId) {
        deleteForEntity("delete from activity_machinery where machinery_id = :id", machineryId);
        deleteForEntity("delete from maintenance_logs where machinery_id = :id", machineryId);
        deleteForEntity("delete from machinery where id = :id", machineryId);
    }

    private AdminManagedEntityDTO updateParcel(Long parcelId, AdminManagedEntityUpdateRequestDTO request) {
        if (request == null) {
            throw new RuntimeException("Datele parcelei sunt obligatorii.");
        }

        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost gasita."));

        parcel.setName(requiredText(request.getName(), "Numele parcelei este obligatoriu."));
        parcel.setCropType(cleanNullable(request.getCropType()));
        if (request.getAreaHectares() == null || request.getAreaHectares() <= 0) {
            throw new RuntimeException("Suprafata parcelei trebuie sa fie mai mare decat 0.");
        }
        parcel.setAreaHectares(request.getAreaHectares());
        return mapParcelEntity(parcelRepository.save(parcel));
    }

    private AdminManagedEntityDTO updateInventoryItem(Long itemId, AdminManagedEntityUpdateRequestDTO request) {
        if (request == null) {
            throw new RuntimeException("Datele produsului sunt obligatorii.");
        }

        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Produsul din magazie nu a fost gasit."));

        item.setName(requiredText(request.getName(), "Numele produsului este obligatoriu."));
        item.setCategory(parseEnum(ItemCategory.class, request.getCategory(), "Categoria produsului este invalida."));
        item.setUnitOfMeasure(requiredText(request.getUnitOfMeasure(), "Unitatea de masura este obligatorie."));
        item.setQuantityAvailable(nonNegative(request.getQuantityAvailable(), "Cantitatea disponibila nu poate fi negativa."));
        item.setMinimumStockThreshold(nonNegative(request.getMinimumStockThreshold(), "Pragul minim nu poate fi negativ."));
        item.setUnitPrice(request.getUnitPrice() != null ? nonNegative(request.getUnitPrice(), "Pretul unitar nu poate fi negativ.") : null);
        return mapInventoryEntity(inventoryItemRepository.save(item));
    }

    private AdminManagedEntityDTO updateMachinery(Long machineryId, AdminManagedEntityUpdateRequestDTO request) {
        if (request == null) {
            throw new RuntimeException("Datele utilajului sunt obligatorii.");
        }

        Machinery machinery = machineryRepository.findById(machineryId)
                .orElseThrow(() -> new RuntimeException("Utilajul nu a fost gasit."));

        machinery.setName(requiredText(request.getName(), "Numele utilajului este obligatoriu."));
        machinery.setModel(cleanNullable(request.getModel()));
        machinery.setLicensePlate(cleanNullable(request.getLicensePlate()));
        machinery.setType(parseEnum(MachineryType.class, request.getType(), "Tipul utilajului este invalid."));
        machinery.setStatus(parseEnum(MachineryStatus.class, request.getStatus(), "Statusul utilajului este invalid."));
        machinery.setTotalHours(nonNegativeInteger(request.getTotalHours(), "Orele totale nu pot fi negative."));
        machinery.setMaintenanceIntervalHours(nonNegativeInteger(request.getMaintenanceIntervalHours(), "Intervalul de mentenanta nu poate fi negativ."));
        if (machinery.getTotalHours() != null && machinery.getMaintenanceIntervalHours() != null) {
            machinery.setNextMaintenanceHours(machinery.getTotalHours() + machinery.getMaintenanceIntervalHours());
        }
        return mapMachineryEntity(machineryRepository.save(machinery));
    }

    private void delete(String sql, Long farmId) {
        entityManager.createNativeQuery(sql)
                .setParameter("farmId", farmId)
                .executeUpdate();
    }

    private void deleteForUser(String sql, Long userId) {
        entityManager.createNativeQuery(sql)
                .setParameter("userId", userId)
                .executeUpdate();
    }

    private void deleteForEntity(String sql, Long entityId) {
        entityManager.createNativeQuery(sql)
                .setParameter("id", entityId)
                .executeUpdate();
    }

    private AdminManagedEntityDTO mapParcelEntity(Parcel parcel) {
        AdminManagedEntityDTO dto = baseEntity("parcels", parcel.getId(), parcel.getName(), parcel.getFarm());
        dto.setCategory(parcel.getCropType());
        dto.setDetails(formatNumber(parcel.getAreaHectares()) + " ha");
        Map<String, Object> attributes = new LinkedHashMap<>();
        attributes.put("name", parcel.getName());
        attributes.put("cropType", parcel.getCropType());
        attributes.put("areaHectares", parcel.getAreaHectares());
        dto.setAttributes(attributes);
        return dto;
    }

    private AdminManagedEntityDTO mapActivityEntity(Activity activity) {
        Parcel parcel = activity.getParcel();
        AdminManagedEntityDTO dto = baseEntity("activities", activity.getId(), activity.getTitle(), parcel != null ? parcel.getFarm() : null);
        dto.setCategory(activity.getType() != null ? activity.getType().name() : null);
        dto.setStatus(activity.getStatus() != null ? activity.getStatus().name() : null);
        dto.setDetails(parcel != null ? "Parcela: " + parcel.getName() : "Fara parcela");
        dto.setDateInfo(activity.getStartDate() != null ? activity.getStartDate().toString() : null);
        return dto;
    }

    private AdminManagedEntityDTO mapInventoryEntity(InventoryItem item) {
        AdminManagedEntityDTO dto = baseEntity("inventory", item.getId(), item.getName(), item.getFarm());
        dto.setCategory(item.getCategory() != null ? item.getCategory().name() : null);
        dto.setDetails(formatNumber(item.getQuantityAvailable()) + " " + nullSafe(item.getUnitOfMeasure()));
        dto.setStatus(item.getMinimumStockThreshold() != null && item.getQuantityAvailable() != null && item.getQuantityAvailable() <= item.getMinimumStockThreshold()
                ? "STOC_SCAZUT"
                : "OK");
        Map<String, Object> attributes = new LinkedHashMap<>();
        attributes.put("name", item.getName());
        attributes.put("category", item.getCategory() != null ? item.getCategory().name() : null);
        attributes.put("quantityAvailable", item.getQuantityAvailable());
        attributes.put("unitOfMeasure", item.getUnitOfMeasure());
        attributes.put("minimumStockThreshold", item.getMinimumStockThreshold());
        attributes.put("unitPrice", item.getUnitPrice());
        dto.setAttributes(attributes);
        return dto;
    }

    private AdminManagedEntityDTO mapInventoryRequestEntity(InventoryRequest request) {
        AdminManagedEntityDTO dto = baseEntity("requests", request.getId(), request.getItemName(), request.getFarm());
        dto.setCategory(request.getItemCategory() != null ? request.getItemCategory().name() : null);
        dto.setStatus(request.getStatus() != null ? request.getStatus().name() : null);
        dto.setDetails(formatNumber(request.getQuantityRequested()) + " " + nullSafe(request.getUnitOfMeasure())
                + " | cerut de " + (request.getRequester() != null ? request.getRequester().getUsername() : "-"));
        dto.setDateInfo(request.getDateCreated() != null ? request.getDateCreated().toString() : null);
        return dto;
    }

    private AdminManagedEntityDTO mapMachineryEntity(Machinery machinery) {
        AdminManagedEntityDTO dto = baseEntity("machinery", machinery.getId(), machinery.getName(), machinery.getFarm());
        dto.setCategory(machinery.getType() != null ? machinery.getType().name() : null);
        dto.setStatus(machinery.getStatus() != null ? machinery.getStatus().name() : null);
        dto.setDetails("Ore: " + (machinery.getTotalHours() != null ? machinery.getTotalHours() : 0)
                + " | Service la: " + (machinery.getNextMaintenanceHours() != null ? machinery.getNextMaintenanceHours() : 0));
        dto.setDateInfo(machinery.getPurchaseDate() != null ? machinery.getPurchaseDate().toString() : null);
        Map<String, Object> attributes = new LinkedHashMap<>();
        attributes.put("name", machinery.getName());
        attributes.put("model", machinery.getModel());
        attributes.put("licensePlate", machinery.getLicensePlate());
        attributes.put("type", machinery.getType() != null ? machinery.getType().name() : null);
        attributes.put("status", machinery.getStatus() != null ? machinery.getStatus().name() : null);
        attributes.put("totalHours", machinery.getTotalHours());
        attributes.put("maintenanceIntervalHours", machinery.getMaintenanceIntervalHours());
        dto.setAttributes(attributes);
        return dto;
    }

    private AdminManagedEntityDTO mapMaintenanceEntity(MaintenanceLog log) {
        Machinery machinery = log.getMachinery();
        AdminManagedEntityDTO dto = baseEntity("maintenance", log.getId(), log.getDescription(), machinery != null ? machinery.getFarm() : null);
        dto.setCategory(machinery != null ? machinery.getName() : "Utilaj necunoscut");
        dto.setDetails(formatNumber(log.getCost()) + " RON | ore: " + (log.getHoursAtMaintenance() != null ? log.getHoursAtMaintenance() : 0));
        dto.setDateInfo(log.getDate() != null ? log.getDate().toString() : null);
        return dto;
    }

    private AdminManagedEntityDTO mapCropSeasonEntity(CropSeason season) {
        Parcel parcel = season.getParcel();
        AdminManagedEntityDTO dto = baseEntity("crop-seasons", season.getId(), season.getCropType(), parcel != null ? parcel.getFarm() : null);
        dto.setCategory(season.getHarvestYear() != null ? String.valueOf(season.getHarvestYear()) : null);
        dto.setDetails("Parcela: " + (parcel != null ? parcel.getName() : "-")
                + " | recolta: " + formatNumber(season.getTotalYieldKg()) + " kg");
        return dto;
    }

    private AdminManagedEntityDTO baseEntity(String entityType, Long id, String name, Farm farm) {
        AdminManagedEntityDTO dto = new AdminManagedEntityDTO();
        dto.setEntityType(entityType);
        dto.setId(id);
        dto.setName(name != null && !name.isBlank() ? name : "(fara nume)");
        dto.setFarmId(farm != null ? farm.getId() : null);
        dto.setFarmName(farm != null ? farm.getName() : null);
        return dto;
    }

    private AdminFarmDTO mapFarm(Farm farm, Map<Long, Long> usersByFarmId, Map<Long, Long> parcelsByFarmId) {
        AdminFarmDTO dto = new AdminFarmDTO();
        dto.setId(farm.getId());
        dto.setName(farm.getName());
        dto.setAddress(farm.getAddress());
        dto.setContactEmail(farm.getContactEmail());
        dto.setManagerUsername(farm.getCreatedBy() != null ? farm.getCreatedBy().getUsername() : null);
        dto.setUserCount(usersByFarmId.getOrDefault(farm.getId(), 0L).intValue());
        dto.setParcelCount(parcelsByFarmId.getOrDefault(farm.getId(), 0L).intValue());
        return dto;
    }

    private AdminUserDTO mapUser(User user) {
        AdminUserDTO dto = new AdminUserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setFarmId(user.getFarm() != null ? user.getFarm().getId() : null);
        dto.setFarmName(user.getFarm() != null ? user.getFarm().getName() : null);
        return dto;
    }

    private AdminAuditLogDTO mapAuditLog(AuditLog auditLog) {
        AdminAuditLogDTO dto = new AdminAuditLogDTO();
        dto.setId(auditLog.getId());
        dto.setActorUsername(auditLog.getActorUsername());
        dto.setAction(auditLog.getAction());
        dto.setTargetType(auditLog.getTargetType());
        dto.setTargetId(auditLog.getTargetId());
        dto.setTargetName(auditLog.getTargetName());
        dto.setDetails(auditLog.getDetails());
        dto.setCreatedAt(auditLog.getCreatedAt());
        return dto;
    }

    private void createAuditLog(User actor, String action, String targetType, Long targetId, String targetName, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActorId(actor.getId());
        auditLog.setActorUsername(actor.getUsername());
        auditLog.setAction(action);
        auditLog.setTargetType(targetType);
        auditLog.setTargetId(targetId);
        auditLog.setTargetName(targetName);
        auditLog.setDetails(details);
        auditLogRepository.save(auditLog);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));
    }

    private int countRole(List<User> users, UserRole role) {
        return (int) users.stream()
                .map(User::getRole)
                .filter(role::equals)
                .count();
    }

    private String normalizeEntityType(String entityType) {
        if (entityType == null) {
            throw new RuntimeException("Tipul entitatii este obligatoriu.");
        }

        return entityType.trim().toLowerCase();
    }

    private String requiredText(String value, String errorMessage) {
        String cleaned = cleanNullable(value);
        if (cleaned == null) {
            throw new RuntimeException(errorMessage);
        }
        return cleaned;
    }

    private String cleanNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumType, String value, String errorMessage) {
        try {
            return Enum.valueOf(enumType, requiredText(value, errorMessage));
        } catch (IllegalArgumentException exception) {
            throw new RuntimeException(errorMessage);
        }
    }

    private Double nonNegative(Double value, String errorMessage) {
        if (value == null) {
            return 0.0;
        }
        if (value < 0) {
            throw new RuntimeException(errorMessage);
        }
        return value;
    }

    private Integer nonNegativeInteger(Integer value, String errorMessage) {
        if (value == null) {
            return 0;
        }
        if (value < 0) {
            throw new RuntimeException(errorMessage);
        }
        return value;
    }

    private java.time.LocalDateTime activitySortKey(Activity activity) {
        if (activity.getEndDate() != null) {
            return activity.getEndDate();
        }
        return activity.getStartDate();
    }

    private String formatNumber(Number number) {
        return number != null ? String.format(java.util.Locale.ROOT, "%.2f", number.doubleValue()) : "0.00";
    }

    private String nullSafe(String value) {
        return value != null ? value : "-";
    }
}
