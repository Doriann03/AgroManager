package agro.backend.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class WorkerPayrollReportDTO {
    private Long workerId;
    private String username;
    private Integer year;
    private Integer month;
    private Double hourlyRate = 0.0;
    private Double totalHours = 0.0;
    private Double totalPay = 0.0;
    private Integer completedActivities = 0;
    private List<PayrollTaskDTO> tasks = new ArrayList<>();
}
