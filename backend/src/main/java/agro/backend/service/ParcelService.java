package agro.backend.service;

import agro.backend.model.Parcel;
import agro.backend.model.User;
import agro.backend.repository.ParcelRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor // Lombok generează constructorul pentru injecția repository-ului
public class ParcelService {
    private final ParcelRepository parcelRepository;
    private final UserRepository userRepository;

    public List<Parcel> getParcelsByUsername(String username) {
        // Metoda aceasta trebuie să existe în ParcelRepository
        // List<Parcel> findAllByOwnerUsername(String username);
        return parcelRepository.findAllByOwnerUsername(username);
    }

    public Parcel saveParcel(Parcel parcel, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost găsit: " + username));
        parcel.setOwner(owner);
        return parcelRepository.save(parcel);
    }

    public void deleteParcel(Long id) {
        // Aici s-ar putea adăuga o verificare de securitate
        // pentru a permite ștergerea doar de către proprietar
        parcelRepository.deleteById(id);
    }
}