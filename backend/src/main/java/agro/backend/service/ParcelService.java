package agro.backend.service;

import agro.backend.model.Parcel;
import agro.backend.repository.ParcelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor // Lombok generează constructorul pentru injecția repository-ului
public class ParcelService {

    private final ParcelRepository parcelRepository;

    public List<Parcel> getAllParcels() {
        return parcelRepository.findAll();
    }

    public Parcel saveParcel(Parcel parcel) {
        // Aici poți adăuga validări (ex: suprafața să nu fie negativă)
        return parcelRepository.save(parcel);
    }

    public void deleteParcel(Long id) {
        parcelRepository.deleteById(id);
    }
}