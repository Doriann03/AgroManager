package agro.backend.controller;

import agro.backend.model.MaintenanceLog;
import agro.backend.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/machinery/{machineryId}/maintenance-logs")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<MaintenanceLog> addMaintenanceLog(
            @PathVariable Long machineryId,
            @RequestBody MaintenanceLog logEntry) {
        
        MaintenanceLog savedLog = maintenanceService.addLog(machineryId, logEntry);
        return ResponseEntity.ok(savedLog);
    }
}
