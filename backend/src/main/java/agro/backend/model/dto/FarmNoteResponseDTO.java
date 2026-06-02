package agro.backend.model.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FarmNoteResponseDTO {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime dateCreated;
}
