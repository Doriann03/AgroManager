package agro.backend.service;

import agro.backend.model.Farm;
import agro.backend.model.FarmNote;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.EmployeeRequestDTO;
import agro.backend.model.dto.FarmNoteRequestDTO;
import agro.backend.model.dto.FarmNoteResponseDTO;
import agro.backend.repository.FarmNoteRepository;
import agro.backend.repository.FarmRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final FarmNoteRepository farmNoteRepository;
    private final PasswordEncoder passwordEncoder;

    public Farm getMyFarm(User manager) {
        if (manager.getFarm() == null) {
            throw new RuntimeException("Nu sunteti asociat niciunei ferme.");
        }
        return manager.getFarm();
    }

    public Farm updateFarm(User manager, Farm updatedData) {
        Farm farm = getMyFarm(manager);
        farm.setAddress(updatedData.getAddress());
        farm.setContactEmail(updatedData.getContactEmail());
        farm.setVisionAndGoals(updatedData.getVisionAndGoals());
        return farmRepository.save(farm);
    }

    public List<FarmNoteResponseDTO> getFarmNotes(User manager) {
        Farm farm = getMyFarm(manager);
        return farmNoteRepository.findByFarmIdOrderByDateCreatedDesc(farm.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public FarmNoteResponseDTO addFarmNote(User manager, FarmNoteRequestDTO request) {
        Farm farm = getMyFarm(manager);
        FarmNote note = new FarmNote();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setFarm(farm);
        return mapToResponseDTO(farmNoteRepository.save(note));
    }

    private FarmNoteResponseDTO mapToResponseDTO(FarmNote note) {
        FarmNoteResponseDTO dto = new FarmNoteResponseDTO();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setDateCreated(note.getDateCreated());
        return dto;
    }

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

        String username = employeeRequest.getUsername() != null ? employeeRequest.getUsername().trim() : "";
        String email = employeeRequest.getEmail() != null ? employeeRequest.getEmail().trim() : null;

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Numele de utilizator este deja folosit.");
        }

        if (employeeRequest.getRole() != UserRole.AGRONOMIST && employeeRequest.getRole() != UserRole.WORKER) {
            throw new RuntimeException("Rolul angajatului poate fi doar AGRONOMIST sau WORKER.");
        }

        User employee = new User();
        employee.setUsername(username);
        employee.setPassword(passwordEncoder.encode(employeeRequest.getPassword()));
        employee.setEmail(email);
        employee.setRole(employeeRequest.getRole());
        employee.setFarm(manager.getFarm());

        return userRepository.save(employee);
    }
}
