package agro.backend.model.dto;

import agro.backend.model.SubsidyStatus;
import lombok.Data;

@Data
public class ParcelSubsidyResponseDTO {
    private Long id;
    private Long parcelId;
    private String parcelName;
    private Double parcelAreaHectares;
    private Integer year;
    private String subsidyType;
    private Double amountPerHectare;
    private Double totalAmount;
    private SubsidyStatus status;
    private String notes;
}
