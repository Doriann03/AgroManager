package agro.backend.service;

import agro.backend.model.Activity;
import agro.backend.model.Machinery;
import agro.backend.model.Parcel;
import agro.backend.model.dto.ActivityRequestDTO;
import agro.backend.repository.ActivityRepository;
import agro.backend.repository.MachineryRepository;
import agro.backend.repository.ParcelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ParcelRepository parcelRepository;
    private final MachineryRepository machineryRepository;

    public List<Activity> getActivitiesByParcelId(Long parcelId) {
        return activityRepository.findByParcelId(parcelId);
    }

    public Activity createActivity(ActivityRequestDTO dto, String username) {
        // Găsim parcela și verificăm apartenența
        Parcel parcel = parcelRepository.findById(dto.getParcelId())
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost găsită"));
        
        if (!parcel.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("Nu sunteți proprietarul acestei parcele");
        }

        // Găsim utilajele (în cazul tău, deocamdată unul selectat)
        Set<Machinery> selectedMachineries = new HashSet<>();
        if (dto.getMachineryIds() != null && !dto.getMachineryIds().isEmpty()) {
            List<Machinery> machineries = machineryRepository.findAllById(dto.getMachineryIds());
            // Verificare suplimentară: utilajele aparțin fermierului?
            for (Machinery m : machineries) {
                 if (!m.getOwner().getUsername().equals(username)) {
                     throw new RuntimeException("Un utilaj selectat nu vă aparține!");
                 }
            }
            selectedMachineries.addAll(machineries);
        }

        // Creăm activitatea
        Activity activity = new Activity();
        activity.setTitle(dto.getTitle());
        // Dacă frontend-ul trimite data, o folosim; altfel setăm ora curentă
        activity.setStartDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDateTime.now()); 
        activity.setParcel(parcel);
        activity.setMachineries(selectedMachineries);

        return activityRepository.save(activity);
    }
}