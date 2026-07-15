package agro.backend.model.dto;

import agro.backend.model.UserRole;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class EmployeeRequestDTO {
    private String username;
    private String password;
    private String email;
    private UserRole role;

    @PositiveOrZero(message = "Tariful orar nu poate fi negativ.")
    private Double hourlyRate;

    @PositiveOrZero(message = "Salariul lunar nu poate fi negativ.")
    private Double monthlySalary;
}
