package agro.backend.model.dto;

import agro.backend.model.UserRole;
import lombok.Data;

@Data
public class PayrollEmployeeRowDTO {
    private Long employeeId;
    private String username;
    private UserRole role;
    private Double hourlyRate;
    private Double monthlySalary;
    private Double hoursWorked = 0.0;
    private Double estimatedPay = 0.0;
    private Integer completedActivities = 0;
}
