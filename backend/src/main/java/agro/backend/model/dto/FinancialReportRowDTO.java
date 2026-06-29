package agro.backend.model.dto;

import lombok.Data;

@Data
public class FinancialReportRowDTO {
    private Long seasonId;
    private Long parcelId;
    private String parcelName;
    private String cropType;
    private Integer harvestYear;
    private Double areaHectares;
    private Double totalYieldKg;
    private Double yieldPerHectareKg;
    private Double salePricePerKg;
    private Double revenueOverride;
    private Double totalRevenue;
    private Double revenuePerHectare;
    private Double totalInputCost;
    private Double workerLaborCost;
    private Double totalDirectCost;
    private Double costPerHectare;
    private Double profit;
    private Double profitPerHectare;
}
