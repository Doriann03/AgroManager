package agro.backend.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminManagedEntityUpdateRequestDTO {
    private String name;
    private String cropType;
    private Double areaHectares;
    private String category;
    private Double quantityAvailable;
    private String unitOfMeasure;
    private Double minimumStockThreshold;
    private Double unitPrice;
    private String model;
    private String licensePlate;
    private String type;
    private String status;
    private Integer totalHours;
    private Integer maintenanceIntervalHours;
}
