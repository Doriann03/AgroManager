package agro.backend.model.dto;

import agro.backend.model.UserRole;
import lombok.Data;

@Data
public class EmployeeRequestDTO {
    private String username;
    private String password;
    private String email;
    private UserRole role; // Va fi AGRONOMIST sau WORKER
}
