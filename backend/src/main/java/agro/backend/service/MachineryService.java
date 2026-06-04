package agro.backend.service;

import agro.backend.model.Machinery;
import agro.backend.model.User;
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

    public Machinery saveMachinery(Machinery machinery, User user) {
        if (user.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio fermă.");
        }
        machinery.setFarm(user.getFarm());
        return machineryRepository.save(machinery);
    }

    public Machinery updateMachinery(Long id, Machinery updatedMachinery, User user) {
        Machinery existingMachinery = machineryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilajul nu a fost găsit"));

        if (user.getFarm() == null || !existingMachinery.getFarm().getId().equals(user.getFarm().getId())) {
            throw new RuntimeException("Nu aveți permisiunea să modificați acest utilaj.");
        }

        existingMachinery.setName(updatedMachinery.getName());
        existingMachinery.setType(updatedMachinery.getType());
        existingMachinery.setModel(updatedMachinery.getModel());
        existingMachinery.setLicensePlate(updatedMachinery.getLicensePlate());
        existingMachinery.setTotalHours(updatedMachinery.getTotalHours());
        existingMachinery.setStatus(updatedMachinery.getStatus());
        existingMachinery.setPurchaseDate(updatedMachinery.getPurchaseDate());
        existingMachinery.setMaintenanceIntervalHours(updatedMachinery.getMaintenanceIntervalHours());
        
        // La prima setare a intervalului, calculăm și următoarea revizie
        if (existingMachinery.getNextMaintenanceHours() == null && updatedMachinery.getTotalHours() != null && updatedMachinery.getMaintenanceIntervalHours() != null) {
            existingMachinery.setNextMaintenanceHours(updatedMachinery.getTotalHours() + updatedMachinery.getMaintenanceIntervalHours());
        }

        return machineryRepository.save(existingMachinery);
    }

    public void deleteMachinery(Long id) {
        machineryRepository.deleteById(id);
    }
}
