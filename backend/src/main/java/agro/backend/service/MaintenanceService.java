package agro.backend.service;

import agro.backend.model.Machinery;
import agro.backend.model.MaintenanceLog;
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
    public MaintenanceLog addLog(Long machineryId, MaintenanceLog logEntry) {
        Machinery machinery = machineryRepository.findById(machineryId)
                .orElseThrow(() -> new RuntimeException("Utilajul nu a fost găsit."));

        logEntry.setMachinery(machinery);

        // Actualizam datele pe utilajul principal
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
