package agro.backend.model.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ActivityRequestDTO {
    private String title;
    private LocalDateTime startDate;
    private Long parcelId;
    private List<Long> machineryIds;
    private List<Long> assignedWorkerIds; 
    private List<ConsumptionRequestDTO> consumptions; // Lista cu stocurile consumate
}