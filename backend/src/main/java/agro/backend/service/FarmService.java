package agro.backend.service;

import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.EmployeeRequestDTO;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getEmployees(User manager) {
        if (manager.getFarm() == null) {
            throw new RuntimeException("Managerul nu are o fermă asociată.");
        }
        return userRepository.findAllByFarmId(manager.getFarm().getId());
    }

    public User addEmployee(EmployeeRequestDTO employeeRequest, User manager) {
        if (manager.getFarm() == null) {
            throw new RuntimeException("Managerul nu are o fermă asociată.");
        }

        if (userRepository.existsByUsername(employeeRequest.getUsername())) {
            throw new RuntimeException("Numele de utilizator este deja folosit.");
        }

        if (employeeRequest.getRole() != UserRole.AGRONOMIST && employeeRequest.getRole() != UserRole.WORKER) {
            throw new RuntimeException("Rolul angajatului poate fi doar AGRONOMIST sau WORKER.");
        }

        User employee = new User();
        employee.setUsername(employeeRequest.getUsername());
        employee.setPassword(passwordEncoder.encode(employeeRequest.getPassword()));
        employee.setEmail(employeeRequest.getEmail());
        employee.setRole(employeeRequest.getRole());
        employee.setFarm(manager.getFarm());

        return userRepository.save(employee);
    }
}
