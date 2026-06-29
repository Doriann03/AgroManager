package agro.backend.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PayrollReportDTO {
    private Integer year;
    private Integer month;
    private Double totalWorkerHours = 0.0;
    private Double totalWorkerPay = 0.0;
    private Double totalAgronomistSalary = 0.0;
    private Double totalPayroll = 0.0;
    private List<PayrollEmployeeRowDTO> rows = new ArrayList<>();
}
