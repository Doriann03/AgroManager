package agro.backend.service;

import agro.backend.model.Machinery;
import agro.backend.model.User;
import agro.backend.repository.MachineryRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MachineryService {

    private final MachineryRepository machineryRepository;
    private final UserRepository userRepository;

    public List<Machinery> getMachineryByUsername(String username) {
        return machineryRepository.findAllByOwnerUsername(username);
    }

    public Machinery saveMachinery(Machinery machinery, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost găsit: " + username));
        machinery.setOwner(owner);
        return machineryRepository.save(machinery);
    }

    public void deleteMachinery(Long id) {
        machineryRepository.deleteById(id);
    }
}