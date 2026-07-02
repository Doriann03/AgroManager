package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityConsumption;
import agro.backend.model.ActivityStatus;
import agro.backend.model.CropSeason;
import agro.backend.model.InventoryItem;
import agro.backend.model.Parcel;
import agro.backend.model.ParcelSubsidy;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.FinancialReportDTO;
import agro.backend.model.dto.FinancialReportRowDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.CropSeasonRepository;
import agro.backend.repository.MaintenanceLogRepository;
import agro.backend.repository.ParcelSubsidyRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FinancialReportService {

    private final UserRepository userRepository;
    private final CropSeasonRepository cropSeasonRepository;
    private final ActivityRepository activityRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final ParcelSubsidyRepository parcelSubsidyRepository;

    @Transactional(readOnly = true)
    public FinancialReportDTO getFinancialReport(String username, Integer requestedYear) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        if (currentUser.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio ferma.");
        }

        int year = requestedYear != null ? requestedYear : LocalDate.now().getYear();
        Long farmId = currentUser.getFarm().getId();

        List<CropSeason> seasons = cropSeasonRepository.findAllByFarmAndHarvestYear(farmId, year);
        List<Activity> activities = activityRepository.findWithConsumptionsByFarmAndStatusAndYear(
                farmId,
                ActivityStatus.COMPLETED,
                year);
        List<ParcelSubsidy> subsidies = parcelSubsidyRepository.findAllByFarmAndYear(farmId, year);

        Map<Long, Double> costByParcelId = calculateInputCostsByParcel(activities);
        Map<Long, Double> laborCostByParcelId = calculateWorkerLaborCostsByParcel(activities);
        Map<Long, Double> subsidyByParcelId = calculateSubsidiesByParcel(subsidies);
        Map<Long, Parcel> subsidyParcelsById = collectSubsidyParcelsById(subsidies);
        Map<Long, Parcel> activityParcelsById = collectActivityParcelsById(activities);
        Set<Long> rowParcelIds = new HashSet<>();

        FinancialReportDTO report = new FinancialReportDTO();
        report.setYear(year);

        for (CropSeason season : seasons) {
            Long parcelId = season.getParcel().getId();
            rowParcelIds.add(parcelId);
            FinancialReportRowDTO row = buildRow(
                    season,
                    costByParcelId.getOrDefault(parcelId, 0.0),
                    laborCostByParcelId.getOrDefault(parcelId, 0.0),
                    subsidyByParcelId.getOrDefault(parcelId, 0.0));
            report.getRows().add(row);
            addRowTotals(report, row);
        }

        for (Map.Entry<Long, Parcel> entry : subsidyParcelsById.entrySet()) {
            activityParcelsById.putIfAbsent(entry.getKey(), entry.getValue());
        }

        for (Map.Entry<Long, Parcel> entry : activityParcelsById.entrySet()) {
            Long parcelId = entry.getKey();
            if (rowParcelIds.contains(parcelId)) {
                continue;
            }

            double inputCost = costByParcelId.getOrDefault(parcelId, 0.0);
            double laborCost = laborCostByParcelId.getOrDefault(parcelId, 0.0);
            double subsidyRevenue = subsidyByParcelId.getOrDefault(parcelId, 0.0);
            if (inputCost <= 0 && laborCost <= 0 && subsidyRevenue <= 0) {
                continue;
            }

            FinancialReportRowDTO row = buildCostOnlyRow(entry.getValue(), year, inputCost, laborCost, subsidyRevenue);
            report.getRows().add(row);
            addRowTotals(report, row);
        }

        report.setAdministrativeSalaryCost(calculateAdministrativeSalaryCost(farmId));
        report.setMaintenanceCost(value(maintenanceLogRepository.sumCostByFarmAndYear(farmId, year)));
        report.setTotalExpenses(
                value(report.getTotalDirectCost())
                        + value(report.getAdministrativeSalaryCost())
                        + value(report.getMaintenanceCost()));
        report.setTotalProfit(value(report.getTotalRevenue()) - value(report.getTotalExpenses()));

        double totalArea = value(report.getTotalAreaHectares());
        report.setCostPerHectare(perHectare(report.getTotalExpenses(), totalArea));
        report.setDirectCostPerHectare(perHectare(report.getTotalDirectCost(), totalArea));
        report.setRevenuePerHectare(perHectare(report.getTotalRevenue(), totalArea));
        report.setProfitPerHectare(perHectare(report.getTotalProfit(), totalArea));

        return report;
    }

    private void addRowTotals(FinancialReportDTO report, FinancialReportRowDTO row) {
        report.setTotalAreaHectares(report.getTotalAreaHectares() + value(row.getAreaHectares()));
        report.setTotalYieldKg(report.getTotalYieldKg() + value(row.getTotalYieldKg()));
        report.setTotalInputCost(report.getTotalInputCost() + value(row.getTotalInputCost()));
        report.setTotalWorkerLaborCost(report.getTotalWorkerLaborCost() + value(row.getWorkerLaborCost()));
        report.setTotalDirectCost(report.getTotalDirectCost() + value(row.getTotalDirectCost()));
        report.setTotalRevenue(report.getTotalRevenue() + value(row.getTotalRevenue()));
        report.setTotalCropRevenue(report.getTotalCropRevenue() + value(row.getCropRevenue()));
        report.setTotalSubsidyRevenue(report.getTotalSubsidyRevenue() + value(row.getSubsidyRevenue()));
    }

    private Map<Long, Parcel> collectActivityParcelsById(List<Activity> activities) {
        Map<Long, Parcel> parcelsById = new LinkedHashMap<>();
        for (Activity activity : activities) {
            Parcel parcel = activity.getParcel();
            if (parcel != null && parcel.getId() != null) {
                parcelsById.putIfAbsent(parcel.getId(), parcel);
            }
        }
        return parcelsById;
    }

    private Map<Long, Parcel> collectSubsidyParcelsById(List<ParcelSubsidy> subsidies) {
        Map<Long, Parcel> parcelsById = new LinkedHashMap<>();
        for (ParcelSubsidy subsidy : subsidies) {
            Parcel parcel = subsidy.getParcel();
            if (parcel != null && parcel.getId() != null) {
                parcelsById.putIfAbsent(parcel.getId(), parcel);
            }
        }
        return parcelsById;
    }

    private Map<Long, Double> calculateSubsidiesByParcel(List<ParcelSubsidy> subsidies) {
        Map<Long, Double> subsidyByParcelId = new HashMap<>();

        for (ParcelSubsidy subsidy : subsidies) {
            Parcel parcel = subsidy.getParcel();
            if (parcel == null || parcel.getId() == null) {
                continue;
            }
            subsidyByParcelId.merge(parcel.getId(), value(subsidy.getTotalAmount()), Double::sum);
        }

        return subsidyByParcelId;
    }

    private Map<Long, Double> calculateInputCostsByParcel(List<Activity> activities) {
        Map<Long, Double> costByParcelId = new HashMap<>();

        for (Activity activity : activities) {
            Parcel parcel = activity.getParcel();
            if (parcel == null || parcel.getId() == null) {
                continue;
            }

            double activityCost = 0.0;
            for (ActivityConsumption consumption : activity.getConsumptions()) {
                InventoryItem item = consumption.getInventoryItem();
                double quantity = value(consumption.getQuantityUsed());
                double unitPrice = consumption.getUnitPriceAtConsumption() != null
                        ? consumption.getUnitPriceAtConsumption()
                        : item != null ? value(item.getUnitPrice()) : 0.0;
                activityCost += quantity * unitPrice;
            }

            costByParcelId.merge(parcel.getId(), activityCost, Double::sum);
        }

        return costByParcelId;
    }

    private Map<Long, Double> calculateWorkerLaborCostsByParcel(List<Activity> activities) {
        Map<Long, Double> laborCostByParcelId = new HashMap<>();

        for (Activity activity : activities) {
            Parcel parcel = activity.getParcel();
            if (parcel == null || parcel.getId() == null || activity.getStartDate() == null || activity.getEndDate() == null) {
                continue;
            }

            double durationHours = Duration.between(activity.getStartDate(), activity.getEndDate()).toMinutes() / 60.0;
            if (durationHours <= 0) {
                continue;
            }

            double activityLaborCost = activity.getAssignedWorkers().stream()
                    .filter(worker -> worker.getRole() == UserRole.WORKER)
                    .mapToDouble(worker -> durationHours * value(worker.getHourlyRate()))
                    .sum();

            laborCostByParcelId.merge(parcel.getId(), activityLaborCost, Double::sum);
        }

        return laborCostByParcelId;
    }

    private double calculateAdministrativeSalaryCost(Long farmId) {
        return userRepository.findByFarmIdAndRoleIn(farmId, List.of(UserRole.AGRONOMIST))
                .stream()
                .mapToDouble(user -> value(user.getMonthlySalary()) * 12)
                .sum();
    }

    private FinancialReportRowDTO buildRow(CropSeason season, double totalInputCost, double workerLaborCost, double subsidyRevenue) {
        Parcel parcel = season.getParcel();
        double area = parcel != null ? parcel.getAreaHectares() : 0.0;
        double totalYieldKg = value(season.getTotalYieldKg());
        double cropRevenue = calculateRevenue(season, totalYieldKg);
        double totalRevenue = cropRevenue + subsidyRevenue;
        double totalDirectCost = totalInputCost + workerLaborCost;
        double profit = totalRevenue - totalDirectCost;

        FinancialReportRowDTO row = new FinancialReportRowDTO();
        row.setSeasonId(season.getId());
        row.setParcelId(parcel != null ? parcel.getId() : null);
        row.setParcelName(parcel != null ? parcel.getName() : "Parcela necunoscuta");
        row.setCropType(season.getCropType());
        row.setHarvestYear(season.getHarvestYear());
        row.setAreaHectares(area);
        row.setTotalYieldKg(totalYieldKg);
        row.setYieldPerHectareKg(perHectare(totalYieldKg, area));
        row.setSalePricePerKg(season.getSalePricePerKg());
        row.setRevenueOverride(season.getRevenueOverride());
        row.setCropRevenue(cropRevenue);
        row.setSubsidyRevenue(subsidyRevenue);
        row.setTotalRevenue(totalRevenue);
        row.setRevenuePerHectare(perHectare(totalRevenue, area));
        row.setTotalInputCost(totalInputCost);
        row.setWorkerLaborCost(workerLaborCost);
        row.setTotalDirectCost(totalDirectCost);
        row.setCostPerHectare(perHectare(totalDirectCost, area));
        row.setProfit(profit);
        row.setProfitPerHectare(perHectare(profit, area));
        return row;
    }

    private FinancialReportRowDTO buildCostOnlyRow(Parcel parcel, int year, double totalInputCost, double workerLaborCost, double subsidyRevenue) {
        double area = parcel != null ? parcel.getAreaHectares() : 0.0;
        double totalDirectCost = totalInputCost + workerLaborCost;
        double totalRevenue = subsidyRevenue;

        FinancialReportRowDTO row = new FinancialReportRowDTO();
        row.setSeasonId(null);
        row.setParcelId(parcel != null ? parcel.getId() : null);
        row.setParcelName(parcel != null ? parcel.getName() : "Parcela necunoscuta");
        row.setCropType(parcel != null && parcel.getCropType() != null ? parcel.getCropType() : "Fara sezon");
        row.setHarvestYear(year);
        row.setAreaHectares(area);
        row.setTotalYieldKg(0.0);
        row.setYieldPerHectareKg(0.0);
        row.setSalePricePerKg(null);
        row.setRevenueOverride(null);
        row.setCropRevenue(0.0);
        row.setSubsidyRevenue(subsidyRevenue);
        row.setTotalRevenue(totalRevenue);
        row.setRevenuePerHectare(perHectare(totalRevenue, area));
        row.setTotalInputCost(totalInputCost);
        row.setWorkerLaborCost(workerLaborCost);
        row.setTotalDirectCost(totalDirectCost);
        row.setCostPerHectare(perHectare(totalDirectCost, area));
        row.setProfit(totalRevenue - totalDirectCost);
        row.setProfitPerHectare(perHectare(totalRevenue - totalDirectCost, area));
        return row;
    }

    private double calculateRevenue(CropSeason season, double totalYieldKg) {
        if (season.getRevenueOverride() != null) {
            return season.getRevenueOverride();
        }

        if (season.getSalePricePerKg() != null) {
            return totalYieldKg * season.getSalePricePerKg();
        }

        return 0.0;
    }

    private double perHectare(double value, double areaHectares) {
        if (areaHectares <= 0) {
            return 0.0;
        }
        return value / areaHectares;
    }

    private double value(Double number) {
        return number != null ? number : 0.0;
    }
}
