package agro.backend.controller;

import agro.backend.model.dto.AdminAuditLogDTO;
import agro.backend.model.dto.AdminFarmDTO;
import agro.backend.model.dto.AdminFarmUpdateRequestDTO;
import agro.backend.model.dto.AdminManagedEntityDTO;
import agro.backend.model.dto.AdminManagedEntityUpdateRequestDTO;
import agro.backend.model.dto.AdminStatsDTO;
import agro.backend.model.dto.AdminUserDTO;
import agro.backend.model.dto.AdminUserUpdateRequestDTO;
import agro.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/farms")
    public ResponseEntity<List<AdminFarmDTO>> getFarms() {
        return ResponseEntity.ok(adminService.getFarms());
    }

    @DeleteMapping("/farms/{farmId}")
    public ResponseEntity<Void> deleteFarm(
            @PathVariable Long farmId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        adminService.deleteFarm(farmId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/farms/{farmId}")
    public ResponseEntity<AdminFarmDTO> updateFarm(
            @PathVariable Long farmId,
            @RequestBody AdminFarmUpdateRequestDTO request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(adminService.updateFarm(farmId, request, principal.getName()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        adminService.deleteUser(userId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<AdminUserDTO> updateUser(
            @PathVariable Long userId,
            @RequestBody AdminUserUpdateRequestDTO request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(adminService.updateUser(userId, request, principal.getName()));
    }

    @GetMapping("/entities/{entityType}")
    public ResponseEntity<List<AdminManagedEntityDTO>> getManagedEntities(@PathVariable String entityType) {
        return ResponseEntity.ok(adminService.getManagedEntities(entityType));
    }

    @DeleteMapping("/entities/{entityType}/{entityId}")
    public ResponseEntity<Void> deleteManagedEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        adminService.deleteManagedEntity(entityType, entityId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/entities/{entityType}/{entityId}")
    public ResponseEntity<AdminManagedEntityDTO> updateManagedEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestBody AdminManagedEntityUpdateRequestDTO request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(adminService.updateManagedEntity(entityType, entityId, request, principal.getName()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AdminAuditLogDTO>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }
}
