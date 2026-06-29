package agro.backend.model.dto;

import agro.backend.model.UserRole;
import lombok.Data;

@Data
public class AdminUserDTO {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private Long farmId;
    private String farmName;
}
