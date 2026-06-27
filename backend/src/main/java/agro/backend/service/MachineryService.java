package agro.backend.service;

import agro.backend.model.Machinery;
import agro.backend.model.MachineryStatus;
import agro.backend.model.User;
import agro.backend.model.dto.MachineryRequestDTO;
import agro.backend.repository.MachineryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MachineryService {

    private final MachineryRepository machineryRepository;

    public List<Machinery> getMachineryByFarm(Long farmId) {
        return machineryRepository.findAllByFarmId(farmId);
    }

    public Machinery saveMachinery(MachineryRequestDTO request, User user) {
        if (user.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio ferma.");
        }
        Machinery machinery = new Machinery();
        applyRequest(machinery, request);
        machinery.setStatus(request.getStatus() != null ? request.getStatus() : MachineryStatus.DISPONIBIL);
        machinery.setFarm(user.getFarm());
        return machineryRepository.save(machinery);
    }

    public Machinery updateMachinery(Long id, MachineryRequestDTO request, User user) {
        Machinery existingMachinery = machineryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilajul nu a fost gasit"));

        if (user.getFarm() == null || !existingMachinery.getFarm().getId().equals(user.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea sa modificati acest utilaj.");
        }

        applyRequest(existingMachinery, request);
        if (request.getStatus() != null) {
            existingMachinery.setStatus(request.getStatus());
        }

        if (existingMachinery.getNextMaintenanceHours() == null
                && request.getTotalHours() != null
                && request.getMaintenanceIntervalHours() != null) {
            existingMachinery.setNextMaintenanceHours(request.getTotalHours() + request.getMaintenanceIntervalHours());
        }

        return machineryRepository.save(existingMachinery);
    }

    public void deleteMachinery(Long id, User user) {
        Machinery existingMachinery = machineryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilajul nu a fost gasit"));

        if (user.getFarm() == null || !existingMachinery.getFarm().getId().equals(user.getFarm().getId())) {
            throw new RuntimeException("Nu aveti permisiunea sa stergeti acest utilaj.");
        }

        machineryRepository.delete(existingMachinery);
    }

    private void applyRequest(Machinery machinery, MachineryRequestDTO request) {
        machinery.setName(request.getName().trim());
        machinery.setType(request.getType());
        machinery.setModel(trimToNull(request.getModel()));
        machinery.setLicensePlate(trimToNull(request.getLicensePlate()));
        machinery.setTotalHours(request.getTotalHours());
        machinery.setPurchaseDate(request.getPurchaseDate());
        machinery.setMaintenanceIntervalHours(request.getMaintenanceIntervalHours());
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
