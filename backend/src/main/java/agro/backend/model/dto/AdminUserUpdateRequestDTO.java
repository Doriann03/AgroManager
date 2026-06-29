package agro.backend.model.dto;

import agro.backend.model.UserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserUpdateRequestDTO {
    private String username;
    private String email;
    private UserRole role;
    private Long farmId;
}
