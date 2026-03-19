package agro.backend.model.dto;

import lombok.Data;

@Data
public class CropSeasonResponseDTO {
    private Long id;
    private Integer harvestYear;
    private String cropType;
    private Long parcelId;
}