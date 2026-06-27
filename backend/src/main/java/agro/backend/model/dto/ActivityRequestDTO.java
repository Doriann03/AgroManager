package agro.backend.model.dto;

import agro.backend.model.ActivityType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ActivityRequestDTO {

    @NotBlank(message = "Titlul lucrarii este obligatoriu.")
    private String title;
    private ActivityType type;
    private Double harvestedYieldKg;
    private LocalDateTime startDate;

    @NotNull(message = "Parcela este obligatorie.")
    private Long parcelId;
    private List<Long> machineryIds;

    @NotEmpty(message = "Trebuie selectat cel putin un muncitor.")
    private List<Long> assignedWorkerIds; 

    @Valid
    private List<ConsumptionRequestDTO> consumptions; // Lista cu stocurile consumate
}
