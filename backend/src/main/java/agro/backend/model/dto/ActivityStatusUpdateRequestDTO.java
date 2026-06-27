package agro.backend.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.List;

@Data
public class ActivityStatusUpdateRequestDTO {

    @NotBlank(message = "Statusul este obligatoriu.")
    private String status;

    private String startDate;

    private String endDate;

    private String comments;

    @PositiveOrZero(message = "Cantitatea recoltata nu poate fi negativa.")
    private Double harvestedYieldKg;

    @Valid
    private List<ConsumptionRequestDTO> actualConsumptions;
}
