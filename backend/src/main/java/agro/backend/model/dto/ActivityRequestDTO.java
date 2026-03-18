package agro.backend.model.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ActivityRequestDTO {
    private String title;
    private LocalDateTime startDate;
    private Long parcelId;
    private List<Long> machineryIds; // Lista de ID-uri pentru utilajele selectate
}