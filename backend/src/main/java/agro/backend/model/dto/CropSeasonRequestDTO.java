package agro.backend.model.dto;

import lombok.Data;

@Data
public class CropSeasonRequestDTO {
    private Integer harvestYear;
    private String cropType;
    private Long parcelId;
    private Double totalYieldKg;
}