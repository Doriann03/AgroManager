package agro.backend.service;

import agro.backend.model.Machinery;
import agro.backend.model.MaintenanceLog;
import agro.backend.model.User;
import agro.backend.model.dto.MaintenanceLogRequestDTO;
import agro.backend.repository.MachineryRepository;
import agro.backend.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final MachineryRepository machineryRepository;

    @Transactional
    public MaintenanceLog addLog(Long machineryId, MaintenanceLogRequestDTO request, User user) {
        Machinery machinery = machineryRepository.findById(machineryId)
                .orElseThrow(() -> new RuntimeException("Utilajul nu a fost gasit."));

        if (user.getFarm() == null || !machinery.getFarm().getId().equals(user.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea sa adaugati mentenanta pentru acest utilaj.");
        }

        MaintenanceLog logEntry = new MaintenanceLog();
        logEntry.setDate(request.getDate());
        logEntry.setDescription(request.getDescription().trim());
        logEntry.setCost(request.getCost());
        logEntry.setHoursAtMaintenance(request.getHoursAtMaintenance());
        logEntry.setMachinery(machinery);

        machinery.setLastMaintenanceDate(logEntry.getDate());

        Integer currentHours = logEntry.getHoursAtMaintenance();
        Integer interval = machinery.getMaintenanceIntervalHours();

        if (currentHours != null && interval != null) {
            machinery.setNextMaintenanceHours(currentHours + interval);
        }

        machineryRepository.save(machinery);

        return maintenanceLogRepository.save(logEntry);
    }
}
