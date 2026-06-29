package agro.backend.model.dto;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class EmployeeCompensationRequestDTO {

    @PositiveOrZero(message = "Tariful orar nu poate fi negativ.")
    private Double hourlyRate;

    @PositiveOrZero(message = "Salariul lunar nu poate fi negativ.")
    private Double monthlySalary;
}
