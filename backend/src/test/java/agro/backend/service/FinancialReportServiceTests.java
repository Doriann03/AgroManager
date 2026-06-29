package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityConsumption;
import agro.backend.model.ActivityStatus;
import agro.backend.model.CropSeason;
import agro.backend.model.Farm;
import agro.backend.model.InventoryItem;
import agro.backend.model.ItemCategory;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.FinancialReportDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.CropSeasonRepository;
import agro.backend.repository.MaintenanceLogRepository;
import agro.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialReportServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CropSeasonRepository cropSeasonRepository;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private MaintenanceLogRepository maintenanceLogRepository;

    @InjectMocks
    private FinancialReportService financialReportService;

    @Test
    void reportCalculatesCostRevenueAndProfitPerHectare() {
        Farm farm = farm();
        User manager = manager(farm);
        Parcel parcel = parcel(farm, 2.0);
        CropSeason season = season(parcel, 2026, 1000.0);
        season.setSalePricePerKg(1.5);
        Activity activity = completedActivity(parcel, inventoryItem(farm, 4.0), 50.0);
        activity.getAssignedWorkers().add(worker(farm, 30.0));
        activity.getConsumptions().get(0).setUnitPriceAtConsumption(3.0);
        User agronomist = agronomist(farm, 10.0);

        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(manager));
        when(cropSeasonRepository.findAllByFarmAndHarvestYear(farm.getId(), 2026)).thenReturn(List.of(season));
        when(activityRepository.findWithConsumptionsByFarmAndStatusAndYear(farm.getId(), ActivityStatus.COMPLETED, 2026))
                .thenReturn(List.of(activity));
        when(userRepository.findByFarmIdAndRoleIn(farm.getId(), List.of(UserRole.AGRONOMIST))).thenReturn(List.of(agronomist));
        when(maintenanceLogRepository.sumCostByFarmAndYear(farm.getId(), 2026)).thenReturn(20.0);

        FinancialReportDTO report = financialReportService.getFinancialReport("manager", 2026);

        assertThat(report.getRows()).hasSize(1);
        assertThat(report.getRows().get(0).getTotalInputCost()).isEqualTo(150.0);
        assertThat(report.getRows().get(0).getWorkerLaborCost()).isEqualTo(120.0);
        assertThat(report.getRows().get(0).getTotalDirectCost()).isEqualTo(270.0);
        assertThat(report.getRows().get(0).getCostPerHectare()).isEqualTo(135.0);
        assertThat(report.getRows().get(0).getTotalRevenue()).isEqualTo(1500.0);
        assertThat(report.getRows().get(0).getProfit()).isEqualTo(1230.0);
        assertThat(report.getRows().get(0).getProfitPerHectare()).isEqualTo(615.0);
        assertThat(report.getAdministrativeSalaryCost()).isEqualTo(120.0);
        assertThat(report.getMaintenanceCost()).isEqualTo(20.0);
        assertThat(report.getTotalExpenses()).isEqualTo(410.0);
        assertThat(report.getTotalProfit()).isEqualTo(1090.0);
    }

    @Test
    void manualRevenueOverridesPriceBasedRevenue() {
        Farm farm = farm();
        User manager = manager(farm);
        Parcel parcel = parcel(farm, 4.0);
        CropSeason season = season(parcel, 2026, 1000.0);
        season.setSalePricePerKg(1.5);
        season.setRevenueOverride(2500.0);

        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(manager));
        when(cropSeasonRepository.findAllByFarmAndHarvestYear(farm.getId(), 2026)).thenReturn(List.of(season));
        when(activityRepository.findWithConsumptionsByFarmAndStatusAndYear(farm.getId(), ActivityStatus.COMPLETED, 2026))
                .thenReturn(List.of());
        when(userRepository.findByFarmIdAndRoleIn(farm.getId(), List.of(UserRole.AGRONOMIST))).thenReturn(List.of());
        when(maintenanceLogRepository.sumCostByFarmAndYear(farm.getId(), 2026)).thenReturn(0.0);

        FinancialReportDTO report = financialReportService.getFinancialReport("manager", 2026);

        assertThat(report.getRows().get(0).getTotalRevenue()).isEqualTo(2500.0);
        assertThat(report.getRows().get(0).getRevenuePerHectare()).isEqualTo(625.0);
        assertThat(report.getRows().get(0).getProfit()).isEqualTo(2500.0);
    }

    @Test
    void reportIncludesLaborCostsForParcelsWithoutCropSeason() {
        Farm farm = farm();
        User manager = manager(farm);
        Parcel parcel = parcel(farm, 3.0);
        Activity activity = completedActivity(parcel, inventoryItem(farm, 4.0), 50.0);
        activity.getAssignedWorkers().add(worker(farm, 30.0));

        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(manager));
        when(cropSeasonRepository.findAllByFarmAndHarvestYear(farm.getId(), 2026)).thenReturn(List.of());
        when(activityRepository.findWithConsumptionsByFarmAndStatusAndYear(farm.getId(), ActivityStatus.COMPLETED, 2026))
                .thenReturn(List.of(activity));
        when(userRepository.findByFarmIdAndRoleIn(farm.getId(), List.of(UserRole.AGRONOMIST))).thenReturn(List.of());
        when(maintenanceLogRepository.sumCostByFarmAndYear(farm.getId(), 2026)).thenReturn(0.0);

        FinancialReportDTO report = financialReportService.getFinancialReport("manager", 2026);

        assertThat(report.getRows()).hasSize(1);
        assertThat(report.getRows().get(0).getSeasonId()).isNull();
        assertThat(report.getRows().get(0).getWorkerLaborCost()).isEqualTo(120.0);
        assertThat(report.getRows().get(0).getTotalDirectCost()).isEqualTo(320.0);
        assertThat(report.getTotalWorkerLaborCost()).isEqualTo(120.0);
        assertThat(report.getTotalExpenses()).isEqualTo(320.0);
        assertThat(report.getTotalProfit()).isEqualTo(-320.0);
    }

    private Farm farm() {
        Farm farm = new Farm();
        farm.setId(1L);
        farm.setName("Ferma Test");
        return farm;
    }

    private User manager(Farm farm) {
        User user = new User();
        user.setId(2L);
        user.setUsername("manager");
        user.setRole(UserRole.FARM_MANAGER);
        user.setFarm(farm);
        return user;
    }

    private User worker(Farm farm, double hourlyRate) {
        User user = new User();
        user.setId(7L);
        user.setUsername("worker");
        user.setRole(UserRole.WORKER);
        user.setHourlyRate(hourlyRate);
        user.setFarm(farm);
        return user;
    }

    private User agronomist(Farm farm, double monthlySalary) {
        User user = new User();
        user.setId(8L);
        user.setUsername("agronom");
        user.setRole(UserRole.AGRONOMIST);
        user.setMonthlySalary(monthlySalary);
        user.setFarm(farm);
        return user;
    }

    private Parcel parcel(Farm farm, double areaHectares) {
        Parcel parcel = new Parcel();
        parcel.setId(3L);
        parcel.setName("Parcela Test");
        parcel.setCropType("Grau");
        parcel.setAreaHectares(areaHectares);
        parcel.setFarm(farm);
        return parcel;
    }

    private CropSeason season(Parcel parcel, int year, double totalYieldKg) {
        CropSeason season = new CropSeason();
        season.setId(4L);
        season.setParcel(parcel);
        season.setHarvestYear(year);
        season.setCropType(parcel.getCropType());
        season.setTotalYieldKg(totalYieldKg);
        return season;
    }

    private InventoryItem inventoryItem(Farm farm, double unitPrice) {
        InventoryItem item = new InventoryItem();
        item.setId(5L);
        item.setName("Seminte grau");
        item.setCategory(ItemCategory.SEED);
        item.setUnitOfMeasure("kg");
        item.setQuantityAvailable(1000.0);
        item.setUnitPrice(unitPrice);
        item.setFarm(farm);
        return item;
    }

    private Activity completedActivity(Parcel parcel, InventoryItem item, double quantityUsed) {
        Activity activity = new Activity();
        activity.setId(6L);
        activity.setParcel(parcel);
        activity.setStatus(ActivityStatus.COMPLETED);
        activity.setStartDate(LocalDateTime.of(2026, 6, 10, 8, 0));
        activity.setEndDate(LocalDateTime.of(2026, 6, 10, 12, 0));

        ActivityConsumption consumption = new ActivityConsumption();
        consumption.setActivity(activity);
        consumption.setInventoryItem(item);
        consumption.setQuantityUsed(quantityUsed);
        activity.getConsumptions().add(consumption);

        return activity;
    }
}
