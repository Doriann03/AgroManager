package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.ActivityStatus;
import agro.backend.model.ActivityType;
import agro.backend.model.Farm;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.PayrollReportDTO;
import agro.backend.model.dto.WorkerPayrollReportDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PayrollReportServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityRepository activityRepository;

    @InjectMocks
    private PayrollReportService payrollReportService;

    @Test
    void workerPayrollCalculatesMonthlyHoursAndPay() {
        Farm farm = farm();
        User worker = worker(farm, 30.0);
        Activity activity = completedActivity(parcel(farm), worker);

        when(userRepository.findByUsername("worker")).thenReturn(Optional.of(worker));
        when(activityRepository.findWorkerActivitiesByStatusAndDateRange(
                worker.getId(),
                ActivityStatus.COMPLETED,
                LocalDateTime.of(2026, 6, 1, 0, 0),
                LocalDateTime.of(2026, 7, 1, 0, 0)))
                .thenReturn(List.of(activity));

        WorkerPayrollReportDTO report = payrollReportService.getWorkerPayroll("worker", 2026, 6);

        assertThat(report.getCompletedActivities()).isEqualTo(1);
        assertThat(report.getTotalHours()).isEqualTo(4.0);
        assertThat(report.getTotalPay()).isEqualTo(120.0);
        assertThat(report.getTasks().get(0).getEstimatedPay()).isEqualTo(120.0);
    }

    @Test
    void farmPayrollCombinesWorkerPayAndAgronomistSalary() {
        Farm farm = farm();
        User manager = manager(farm);
        User worker = worker(farm, 30.0);
        User agronomist = agronomist(farm, 8000.0);
        Activity activity = completedActivity(parcel(farm), worker);

        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(manager));
        when(userRepository.findByFarmIdAndRoleIn(farm.getId(), List.of(UserRole.WORKER, UserRole.AGRONOMIST)))
                .thenReturn(List.of(worker, agronomist));
        when(activityRepository.findFarmActivitiesByStatusAndDateRange(
                farm.getId(),
                ActivityStatus.COMPLETED,
                LocalDateTime.of(2026, 6, 1, 0, 0),
                LocalDateTime.of(2026, 7, 1, 0, 0)))
                .thenReturn(List.of(activity));

        PayrollReportDTO report = payrollReportService.getFarmPayroll("manager", 2026, 6);

        assertThat(report.getTotalWorkerHours()).isEqualTo(4.0);
        assertThat(report.getTotalWorkerPay()).isEqualTo(120.0);
        assertThat(report.getTotalAgronomistSalary()).isEqualTo(8000.0);
        assertThat(report.getTotalPayroll()).isEqualTo(8120.0);
        assertThat(report.getRows()).hasSize(2);
    }

    private Farm farm() {
        Farm farm = new Farm();
        farm.setId(1L);
        farm.setName("Ferma Test");
        return farm;
    }

    private User manager(Farm farm) {
        User user = new User();
        user.setId(2L);
        user.setUsername("manager");
        user.setRole(UserRole.FARM_MANAGER);
        user.setFarm(farm);
        return user;
    }

    private User worker(Farm farm, double hourlyRate) {
        User user = new User();
        user.setId(3L);
        user.setUsername("worker");
        user.setRole(UserRole.WORKER);
        user.setHourlyRate(hourlyRate);
        user.setFarm(farm);
        return user;
    }

    private User agronomist(Farm farm, double monthlySalary) {
        User user = new User();
        user.setId(4L);
        user.setUsername("agronom");
        user.setRole(UserRole.AGRONOMIST);
        user.setMonthlySalary(monthlySalary);
        user.setFarm(farm);
        return user;
    }

    private Parcel parcel(Farm farm) {
        Parcel parcel = new Parcel();
        parcel.setId(5L);
        parcel.setName("Parcela Test");
        parcel.setAreaHectares(10.0);
        parcel.setFarm(farm);
        return parcel;
    }

    private Activity completedActivity(Parcel parcel, User worker) {
        Activity activity = new Activity();
        activity.setId(6L);
        activity.setTitle("Irigare test");
        activity.setType(ActivityType.IRIGAT);
        activity.setStatus(ActivityStatus.COMPLETED);
        activity.setParcel(parcel);
        activity.setStartDate(LocalDateTime.of(2026, 6, 10, 8, 0));
        activity.setEndDate(LocalDateTime.of(2026, 6, 10, 12, 0));
        activity.getAssignedWorkers().add(worker);
        return activity;
    }
}
