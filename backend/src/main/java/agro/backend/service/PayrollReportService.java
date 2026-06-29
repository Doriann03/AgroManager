package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityStatus;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.PayrollEmployeeRowDTO;
import agro.backend.model.dto.PayrollReportDTO;
import agro.backend.model.dto.PayrollTaskDTO;
import agro.backend.model.dto.WorkerPayrollReportDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayrollReportService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    @Transactional(readOnly = true)
    public WorkerPayrollReportDTO getWorkerPayroll(String username, Integer requestedYear, Integer requestedMonth) {
        User worker = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        if (worker.getRole() != UserRole.WORKER) {
            throw new RuntimeException("Raportul lunar este disponibil doar pentru muncitori.");
        }

        YearMonth period = resolvePeriod(requestedYear, requestedMonth);
        List<Activity> activities = activityRepository.findWorkerActivitiesByStatusAndDateRange(
                worker.getId(),
                ActivityStatus.COMPLETED,
                period.atDay(1).atStartOfDay(),
                period.plusMonths(1).atDay(1).atStartOfDay());

        WorkerPayrollReportDTO report = new WorkerPayrollReportDTO();
        report.setWorkerId(worker.getId());
        report.setUsername(worker.getUsername());
        report.setYear(period.getYear());
        report.setMonth(period.getMonthValue());
        report.setHourlyRate(value(worker.getHourlyRate()));

        activities.stream()
                .sorted(Comparator.comparing(this::activityDate).reversed())
                .forEach(activity -> {
                    PayrollTaskDTO task = buildTask(worker, activity);
                    report.getTasks().add(task);
                    report.setTotalHours(report.getTotalHours() + value(task.getHoursWorked()));
                    report.setTotalPay(report.getTotalPay() + value(task.getEstimatedPay()));
                });

        report.setCompletedActivities(report.getTasks().size());
        return report;
    }

    @Transactional(readOnly = true)
    public PayrollReportDTO getFarmPayroll(String username, Integer requestedYear, Integer requestedMonth) {
        User manager = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));

        if (manager.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio ferma.");
        }

        YearMonth period = resolvePeriod(requestedYear, requestedMonth);
        Long farmId = manager.getFarm().getId();

        List<User> employees = userRepository.findByFarmIdAndRoleIn(
                farmId,
                List.of(UserRole.WORKER, UserRole.AGRONOMIST));
        List<Activity> activities = activityRepository.findFarmActivitiesByStatusAndDateRange(
                farmId,
                ActivityStatus.COMPLETED,
                period.atDay(1).atStartOfDay(),
                period.plusMonths(1).atDay(1).atStartOfDay());

        Map<Long, PayrollEmployeeRowDTO> rowsByEmployeeId = new LinkedHashMap<>();
        for (User employee : employees) {
            PayrollEmployeeRowDTO row = new PayrollEmployeeRowDTO();
            row.setEmployeeId(employee.getId());
            row.setUsername(employee.getUsername());
            row.setRole(employee.getRole());
            row.setHourlyRate(employee.getHourlyRate());
            row.setMonthlySalary(employee.getMonthlySalary());

            if (employee.getRole() == UserRole.AGRONOMIST) {
                row.setEstimatedPay(value(employee.getMonthlySalary()));
            }

            rowsByEmployeeId.put(employee.getId(), row);
        }

        for (Activity activity : activities) {
            double hoursWorked = calculateHours(activity);
            if (hoursWorked <= 0) {
                continue;
            }

            for (User assignedWorker : activity.getAssignedWorkers()) {
                if (assignedWorker.getRole() != UserRole.WORKER) {
                    continue;
                }

                PayrollEmployeeRowDTO row = rowsByEmployeeId.get(assignedWorker.getId());
                if (row == null) {
                    continue;
                }

                row.setHoursWorked(row.getHoursWorked() + hoursWorked);
                row.setEstimatedPay(row.getEstimatedPay() + hoursWorked * value(assignedWorker.getHourlyRate()));
                row.setCompletedActivities(row.getCompletedActivities() + 1);
            }
        }

        PayrollReportDTO report = new PayrollReportDTO();
        report.setYear(period.getYear());
        report.setMonth(period.getMonthValue());

        for (PayrollEmployeeRowDTO row : rowsByEmployeeId.values()) {
            report.getRows().add(row);
            if (row.getRole() == UserRole.WORKER) {
                report.setTotalWorkerHours(report.getTotalWorkerHours() + value(row.getHoursWorked()));
                report.setTotalWorkerPay(report.getTotalWorkerPay() + value(row.getEstimatedPay()));
            } else if (row.getRole() == UserRole.AGRONOMIST) {
                report.setTotalAgronomistSalary(report.getTotalAgronomistSalary() + value(row.getEstimatedPay()));
            }
        }

        report.setTotalPayroll(value(report.getTotalWorkerPay()) + value(report.getTotalAgronomistSalary()));
        return report;
    }

    private PayrollTaskDTO buildTask(User worker, Activity activity) {
        double hoursWorked = calculateHours(activity);
        double hourlyRate = value(worker.getHourlyRate());
        Parcel parcel = activity.getParcel();

        PayrollTaskDTO task = new PayrollTaskDTO();
        task.setActivityId(activity.getId());
        task.setTitle(activity.getTitle());
        task.setType(activity.getType() != null ? activity.getType().name() : null);
        task.setStatus(activity.getStatus() != null ? activity.getStatus().name() : null);
        task.setParcelName(parcel != null ? parcel.getName() : "Parcela necunoscuta");
        task.setStartDate(activity.getStartDate());
        task.setEndDate(activity.getEndDate());
        task.setHoursWorked(hoursWorked);
        task.setHourlyRate(hourlyRate);
        task.setEstimatedPay(hoursWorked * hourlyRate);
        return task;
    }

    private YearMonth resolvePeriod(Integer requestedYear, Integer requestedMonth) {
        LocalDate today = LocalDate.now();
        int year = requestedYear != null ? requestedYear : today.getYear();
        int month = requestedMonth != null ? requestedMonth : today.getMonthValue();

        if (month < 1 || month > 12) {
            throw new RuntimeException("Luna trebuie sa fie intre 1 si 12.");
        }

        return YearMonth.of(year, month);
    }

    private LocalDateTime activityDate(Activity activity) {
        if (activity.getEndDate() != null) {
            return activity.getEndDate();
        }
        if (activity.getStartDate() != null) {
            return activity.getStartDate();
        }
        return LocalDateTime.MIN;
    }

    private double calculateHours(Activity activity) {
        if (activity.getStartDate() == null || activity.getEndDate() == null) {
            return 0.0;
        }

        long minutes = Duration.between(activity.getStartDate(), activity.getEndDate()).toMinutes();
        if (minutes <= 0) {
            return 0.0;
        }

        return minutes / 60.0;
    }

    private double value(Double number) {
        return number != null ? number : 0.0;
    }
}
