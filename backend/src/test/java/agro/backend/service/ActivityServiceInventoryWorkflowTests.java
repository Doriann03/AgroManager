package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityConsumption;
import agro.backend.model.ActivityStatus;
import agro.backend.model.Farm;
import agro.backend.model.InventoryItem;
import agro.backend.model.ItemCategory;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityServiceInventoryWorkflowTests {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private ParcelRepository parcelRepository;

    @Mock
    private MachineryRepository machineryRepository;

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CropSeasonRepository cropSeasonRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ActivityService activityService;

    @Test
    void createActivityDoesNotDeductInventoryAtPlanningTime() {
        Farm farm = farm();
        Parcel parcel = parcel(farm);
        User worker = worker(farm);
        InventoryItem item = inventoryItem(farm, 600.0);

        ActivityRequestDTO request = activityRequest(item.getId(), worker.getId(), parcel.getId(), 200.0);

        when(parcelRepository.findById(parcel.getId())).thenReturn(Optional.of(parcel));
        when(userRepository.findAllById(List.of(worker.getId()))).thenReturn(List.of(worker));
        when(inventoryItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Activity savedActivity = activityService.createActivity(request, agronomist(farm));

        assertThat(item.getQuantityAvailable()).isEqualTo(600.0);
        assertThat(savedActivity.getInventoryDeducted()).isFalse();
        verify(inventoryItemRepository, never()).save(any(InventoryItem.class));
    }

    @Test
    void completingActivityDeductsInventoryOnce() {
        Farm farm = farm();
        Parcel parcel = parcel(farm);
        User worker = worker(farm);
        InventoryItem item = inventoryItem(farm, 600.0);
        Activity activity = activityWithConsumption(parcel, worker, item, 200.0);

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(inventoryItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
        when(parcelRepository.findById(parcel.getId())).thenReturn(Optional.of(parcel));
        when(userRepository.findByFarmIdAndRoleIn(any(), any())).thenReturn(List.of());
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        activityService.updateActivityStatus(activity.getId(), "COMPLETED", null, null, null, null, null, worker);

        assertThat(item.getQuantityAvailable()).isEqualTo(400.0);
        assertThat(activity.getConsumptions().get(0).getUnitPriceAtConsumption()).isEqualTo(2.0);
        assertThat(activity.getInventoryDeducted()).isTrue();
        verify(inventoryItemRepository).save(item);

        activityService.updateActivityStatus(activity.getId(), "COMPLETED", null, null, null, null, null, worker);

        assertThat(item.getQuantityAvailable()).isEqualTo(400.0);
    }

    @Test
    void completingActivityDeductsActualReportedConsumption() {
        Farm farm = farm();
        Parcel parcel = parcel(farm);
        User worker = worker(farm);
        InventoryItem item = inventoryItem(farm, 600.0);
        Activity activity = activityWithConsumption(parcel, worker, item, 200.0);

        ConsumptionRequestDTO actualConsumption = new ConsumptionRequestDTO();
        actualConsumption.setInventoryItemId(item.getId());
        actualConsumption.setQuantityUsed(150.0);

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(inventoryItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
        when(parcelRepository.findById(parcel.getId())).thenReturn(Optional.of(parcel));
        when(userRepository.findByFarmIdAndRoleIn(any(), any())).thenReturn(List.of());
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        activityService.updateActivityStatus(
                activity.getId(),
                "COMPLETED",
                null,
                null,
                null,
                null,
                List.of(actualConsumption),
                worker);

        assertThat(activity.getConsumptions().get(0).getQuantityUsed()).isEqualTo(150.0);
        assertThat(item.getQuantityAvailable()).isEqualTo(450.0);
    }

    @Test
    void completingActivityNotifiesManagersWhenStockDropsBelowThreshold() {
        Farm farm = farm();
        Parcel parcel = parcel(farm);
        User worker = worker(farm);
        User manager = manager(farm);
        InventoryItem item = inventoryItem(farm, 600.0);
        item.setMinimumStockThreshold(500.0);
        Activity activity = activityWithConsumption(parcel, worker, item, 150.0);

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(inventoryItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
        when(parcelRepository.findById(parcel.getId())).thenReturn(Optional.of(parcel));
        when(userRepository.findByFarmIdAndRoleIn(any(), any())).thenReturn(List.of(manager));
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        activityService.updateActivityStatus(activity.getId(), "COMPLETED", null, null, null, null, null, worker);

        assertThat(item.getQuantityAvailable()).isEqualTo(450.0);
        verify(notificationService).createNotification(
                eq(manager),
                argThat(message -> message.contains("Stoc redus pentru Seminte grau")),
                eq("LOW_STOCK"));
    }

    private ActivityRequestDTO activityRequest(Long itemId, Long workerId, Long parcelId, double quantityUsed) {
        ConsumptionRequestDTO consumption = new ConsumptionRequestDTO();
        consumption.setInventoryItemId(itemId);
        consumption.setQuantityUsed(quantityUsed);

        ActivityRequestDTO request = new ActivityRequestDTO();
        request.setTitle("Semanat grau");
        request.setParcelId(parcelId);
        request.setAssignedWorkerIds(List.of(workerId));
        request.setMachineryIds(List.of());
        request.setConsumptions(List.of(consumption));
        return request;
    }

    private Activity activityWithConsumption(Parcel parcel, User worker, InventoryItem item, double quantityUsed) {
        Activity activity = new Activity();
        activity.setId(10L);
        activity.setStatus(ActivityStatus.PENDING);
        activity.setParcel(parcel);
        activity.setInventoryDeducted(false);
        activity.getAssignedWorkers().add(worker);

        ActivityConsumption consumption = new ActivityConsumption();
        consumption.setActivity(activity);
        consumption.setInventoryItem(item);
        consumption.setQuantityUsed(quantityUsed);
        activity.getConsumptions().add(consumption);

        return activity;
    }

    private Farm farm() {
        Farm farm = new Farm();
        farm.setId(1L);
        farm.setName("Ferma Test");
        return farm;
    }

    private Parcel parcel(Farm farm) {
        Parcel parcel = new Parcel();
        parcel.setId(1L);
        parcel.setName("Parcela Test");
        parcel.setFarm(farm);
        return parcel;
    }

    private User worker(Farm farm) {
        User user = new User();
        user.setId(2L);
        user.setUsername("worker");
        user.setRole(UserRole.WORKER);
        user.setFarm(farm);
        return user;
    }

    private User agronomist(Farm farm) {
        User user = new User();
        user.setId(3L);
        user.setUsername("agronom");
        user.setRole(UserRole.AGRONOMIST);
        user.setFarm(farm);
        return user;
    }

    private User manager(Farm farm) {
        User user = new User();
        user.setId(4L);
        user.setUsername("manager");
        user.setRole(UserRole.FARM_MANAGER);
        user.setFarm(farm);
        return user;
    }

    private InventoryItem inventoryItem(Farm farm, double quantityAvailable) {
        InventoryItem item = new InventoryItem();
        item.setId(5L);
        item.setName("Seminte grau");
        item.setCategory(ItemCategory.SEED);
        item.setUnitOfMeasure("kg");
        item.setQuantityAvailable(quantityAvailable);
        item.setMinimumStockThreshold(0.0);
        item.setUnitPrice(2.0);
        item.setFarm(farm);
        return item;
    }
}
