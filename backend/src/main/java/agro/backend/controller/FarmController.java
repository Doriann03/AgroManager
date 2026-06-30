package agro.backend.controller;

import agro.backend.model.Farm;
import agro.backend.model.User;
import agro.backend.model.dto.EmployeeCompensationRequestDTO;
import agro.backend.model.dto.EmployeeRequestDTO;
import agro.backend.model.dto.EmployeeResponseDTO;
import agro.backend.model.dto.FarmNoteRequestDTO;
import agro.backend.model.dto.FarmNoteResponseDTO;
import agro.backend.repository.UserRepository;
import agro.backend.service.FarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new UsernameNotFoundException("Utilizatorul nu este autentificat.");
        }
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost găsit: " + principal.getName()));
    }

    @GetMapping("/my-farm")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<Farm> getMyFarm(Principal principal) {
        User manager = getCurrentUser(principal);
        return ResponseEntity.ok(farmService.getMyFarm(manager));
    }

    @PutMapping("/my-farm")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<Farm> updateMyFarm(@RequestBody Farm farmData, Principal principal) {
        User manager = getCurrentUser(principal);
        try {
            return ResponseEntity.ok(farmService.updateFarm(manager, farmData));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/notes")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<List<FarmNoteResponseDTO>> getNotes(Principal principal) {
        User manager = getCurrentUser(principal);
        return ResponseEntity.ok(farmService.getFarmNotes(manager));
    }

    @PostMapping("/notes")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<FarmNoteResponseDTO> addNote(@RequestBody FarmNoteRequestDTO request, Principal principal) {
        User manager = getCurrentUser(principal);
        return ResponseEntity.ok(farmService.addFarmNote(manager, request));
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<List<EmployeeResponseDTO>> getEmployees(Principal principal) {
        User manager = getCurrentUser(principal);
        try {
            List<EmployeeResponseDTO> employees = farmService.getEmployees(manager);
            return ResponseEntity.ok(employees);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/employees")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<?> addEmployee(@Valid @RequestBody EmployeeRequestDTO employeeRequest, Principal principal) {
        User manager = getCurrentUser(principal);
        try {
            EmployeeResponseDTO newEmployee = farmService.addEmployee(employeeRequest, manager);
            return ResponseEntity.ok(newEmployee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/employees/{employeeId}/compensation")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<EmployeeResponseDTO> updateEmployeeCompensation(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmployeeCompensationRequestDTO request,
            Principal principal) {
        User manager = getCurrentUser(principal);
        try {
            return ResponseEntity.ok(farmService.updateEmployeeCompensation(employeeId, request, manager));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
