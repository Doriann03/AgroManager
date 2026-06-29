package agro.backend.model.dto;

import agro.backend.model.UserRole;
import lombok.Data;

@Data
public class EmployeeResponseDTO {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private Double hourlyRate;
    private Double monthlySalary;
}
