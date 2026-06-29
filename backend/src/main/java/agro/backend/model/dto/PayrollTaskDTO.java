package agro.backend.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PayrollTaskDTO {
    private Long activityId;
    private String title;
    private String type;
    private String status;
    private String parcelName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double hoursWorked;
    private Double hourlyRate;
    private Double estimatedPay;
}
