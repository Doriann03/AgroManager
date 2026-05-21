package agro.backend.service;

import agro.backend.model.Farm;
import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.repository.ParcelRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ParcelService {
    private final ParcelRepository parcelRepository;
    private final UserRepository userRepository;

    public List<Parcel> getParcelsByFarm(Long farmId) {
        return parcelRepository.findAllByFarmId(farmId);
    }

    public Parcel saveParcel(Parcel parcel, User user) {
        if (user.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio fermă.");
        }
        parcel.setFarm(user.getFarm());
        return parcelRepository.save(parcel);
    }

    public Parcel updateParcel(Long id, Parcel updatedParcel, User user) {
        Parcel existingParcel = parcelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost găsită."));
        
        if (user.getFarm() == null || !existingParcel.getFarm().getId().equals(user.getFarm().getId())) {
            throw new RuntimeException("Nu aveți permisiunea de a modifica această parcelă.");
        }

        existingParcel.setName(updatedParcel.getName());
        existingParcel.setCropType(updatedParcel.getCropType());
        existingParcel.setAreaHectares(updatedParcel.getAreaHectares());
        existingParcel.setCoordinatesJson(updatedParcel.getCoordinatesJson());

        return parcelRepository.save(existingParcel);
    }

    public void deleteParcel(Long id) {
        parcelRepository.deleteById(id);
    }
}
