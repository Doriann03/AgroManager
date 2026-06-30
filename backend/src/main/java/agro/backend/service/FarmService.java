package agro.backend.service;

import agro.backend.model.Farm;
import agro.backend.model.FarmNote;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.EmployeeCompensationRequestDTO;
import agro.backend.model.dto.EmployeeRequestDTO;
import agro.backend.model.dto.EmployeeResponseDTO;
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
        String farmName = updatedData.getName() != null ? updatedData.getName().trim() : "";
        if (farmName.isBlank()) {
            throw new RuntimeException("Numele fermei este obligatoriu.");
        }

        farmRepository.findByName(farmName)
                .filter(existingFarm -> !existingFarm.getId().equals(farm.getId()))
                .ifPresent(existingFarm -> {
                    throw new RuntimeException("Exista deja o ferma cu acest nume.");
                });

        farm.setName(farmName);
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

    public List<EmployeeResponseDTO> getEmployees(User manager) {
        if (manager.getFarm() == null) {
            throw new RuntimeException("Managerul nu are o fermă asociată.");
        }
        return userRepository.findAllByFarmId(manager.getFarm().getId())
                .stream()
                .map(this::mapEmployeeToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeResponseDTO addEmployee(EmployeeRequestDTO employeeRequest, User manager) {
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
        employee.setHourlyRate(employeeRequest.getHourlyRate());
        employee.setMonthlySalary(employeeRequest.getMonthlySalary());

        return mapEmployeeToDTO(userRepository.save(employee));
    }

    public EmployeeResponseDTO updateEmployeeCompensation(Long employeeId, EmployeeCompensationRequestDTO request, User manager) {
        if (manager.getFarm() == null) {
            throw new RuntimeException("Managerul nu are o ferma asociata.");
        }

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Angajatul nu a fost gasit."));

        if (employee.getFarm() == null || !employee.getFarm().getId().equals(manager.getFarm().getId())) {
            throw new RuntimeException("Angajatul nu apartine fermei curente.");
        }

        if (employee.getRole() != UserRole.AGRONOMIST && employee.getRole() != UserRole.WORKER) {
            throw new RuntimeException("Se pot actualiza doar angajatii operationali.");
        }

        employee.setHourlyRate(request.getHourlyRate());
        employee.setMonthlySalary(request.getMonthlySalary());

        return mapEmployeeToDTO(userRepository.save(employee));
    }

    private EmployeeResponseDTO mapEmployeeToDTO(User employee) {
        EmployeeResponseDTO dto = new EmployeeResponseDTO();
        dto.setId(employee.getId());
        dto.setUsername(employee.getUsername());
        dto.setEmail(employee.getEmail());
        dto.setRole(employee.getRole());
        dto.setHourlyRate(employee.getHourlyRate());
        dto.setMonthlySalary(employee.getMonthlySalary());
        return dto;
    }
}
