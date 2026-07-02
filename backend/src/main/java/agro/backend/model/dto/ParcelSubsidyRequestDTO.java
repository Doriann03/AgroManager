package agro.backend.model.dto;

import agro.backend.model.SubsidyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ParcelSubsidyRequestDTO {
    @NotNull(message = "Parcela este obligatorie.")
    private Long parcelId;

    @NotNull(message = "Anul subventiei este obligatoriu.")
    private Integer year;

    @NotBlank(message = "Tipul subventiei este obligatoriu.")
    private String subsidyType;

    @PositiveOrZero(message = "Suma pe hectar nu poate fi negativa.")
    private Double amountPerHectare;

    @PositiveOrZero(message = "Suma totala nu poate fi negativa.")
    private Double totalAmount;

    private SubsidyStatus status = SubsidyStatus.ESTIMATED;

    private String notes;
}
