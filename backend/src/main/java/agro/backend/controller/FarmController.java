package agro.backend.controller;

import agro.backend.model.User;
import agro.backend.model.dto.EmployeeRequestDTO;
import agro.backend.repository.UserRepository;
import agro.backend.service.FarmService;
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

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<List<User>> getEmployees(Principal principal) {
        User manager = getCurrentUser(principal);
        try {
            List<User> employees = farmService.getEmployees(manager);
            return ResponseEntity.ok(employees);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/employees")
    @PreAuthorize("hasRole('FARM_MANAGER')")
    public ResponseEntity<?> addEmployee(@RequestBody EmployeeRequestDTO employeeRequest, Principal principal) {
        User manager = getCurrentUser(principal);
        try {
            User newEmployee = farmService.addEmployee(employeeRequest, manager);
            return ResponseEntity.ok(newEmployee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
