package agro.backend.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminAuditLogDTO {
    private Long id;
    private String actorUsername;
    private String action;
    private String targetType;
    private Long targetId;
    private String targetName;
    private String details;
    private LocalDateTime createdAt;
}
