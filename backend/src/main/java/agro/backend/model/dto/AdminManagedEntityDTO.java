package agro.backend.model.dto;

import lombok.Data;

import java.util.Map;

@Data
public class AdminManagedEntityDTO {
    private Long id;
    private String entityType;
    private String name;
    private Long farmId;
    private String farmName;
    private String category;
    private String status;
    private String details;
    private String dateInfo;
    private Map<String, Object> attributes;
}
