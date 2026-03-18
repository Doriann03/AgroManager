package agro.backend.service;

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

    public List<Parcel> getParcelsByUsername(String username) {
        return parcelRepository.findAllByOwnerUsername(username);
    }

    public Parcel saveParcel(Parcel parcel, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost găsit: " + username));
        parcel.setOwner(owner);
        return parcelRepository.save(parcel);
    }

    public Parcel updateParcel(Long id, Parcel updatedParcel, String username) {
        Optional<Parcel> existingParcelOpt = parcelRepository.findById(id);
        
        if (existingParcelOpt.isPresent()) {
            Parcel existingParcel = existingParcelOpt.get();
            
            // Verificare sumară de securitate (să fie al proprietarului)
            if (!existingParcel.getOwner().getUsername().equals(username)) {
                throw new RuntimeException("Nu aveți permisiunea de a modifica această parcelă.");
            }

            existingParcel.setName(updatedParcel.getName());
            existingParcel.setCropType(updatedParcel.getCropType());
            existingParcel.setAreaHectares(updatedParcel.getAreaHectares());
            existingParcel.setCoordinatesJson(updatedParcel.getCoordinatesJson());

            return parcelRepository.save(existingParcel);
        } else {
            throw new RuntimeException("Parcela nu a fost găsită.");
        }
    }

    public void deleteParcel(Long id) {
        parcelRepository.deleteById(id);
    }
}