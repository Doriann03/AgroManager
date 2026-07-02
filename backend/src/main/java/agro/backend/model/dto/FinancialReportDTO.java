package agro.backend.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class FinancialReportDTO {
    private Integer year;
    private Double totalAreaHectares = 0.0;
    private Double totalYieldKg = 0.0;
    private Double totalInputCost = 0.0;
    private Double totalWorkerLaborCost = 0.0;
    private Double totalDirectCost = 0.0;
    private Double administrativeSalaryCost = 0.0;
    private Double maintenanceCost = 0.0;
    private Double totalExpenses = 0.0;
    private Double totalCropRevenue = 0.0;
    private Double totalSubsidyRevenue = 0.0;
    private Double totalRevenue = 0.0;
    private Double totalProfit = 0.0;
    private Double costPerHectare = 0.0;
    private Double directCostPerHectare = 0.0;
    private Double revenuePerHectare = 0.0;
    private Double profitPerHectare = 0.0;
    private List<FinancialReportRowDTO> rows = new ArrayList<>();
}
