package agro.backend.controller;

import agro.backend.model.dto.FinancialReportDTO;
import agro.backend.model.dto.PayrollReportDTO;
import agro.backend.model.dto.WorkerPayrollReportDTO;
import agro.backend.service.FinancialReportService;
import agro.backend.service.PayrollReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final FinancialReportService financialReportService;
    private final PayrollReportService payrollReportService;

    @GetMapping("/financial")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<FinancialReportDTO> getFinancialReport(
            @RequestParam(required = false) Integer year,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(financialReportService.getFinancialReport(principal.getName(), year));
    }

    @GetMapping("/worker-payroll")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerPayrollReportDTO> getWorkerPayrollReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(payrollReportService.getWorkerPayroll(principal.getName(), year, month));
    }

    @GetMapping("/payroll")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<PayrollReportDTO> getPayrollReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(payrollReportService.getFarmPayroll(principal.getName(), year, month));
    }
}
