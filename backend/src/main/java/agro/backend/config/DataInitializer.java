package agro.backend.config;

import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Verificăm dacă există deja un admin, ca să nu îl duplicăm la fiecare restart
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                // ATENȚIE: Parola trebuie să fie criptată!
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@agro.com");
                admin.setRole(UserRole.ADMIN);
                
                userRepository.save(admin);
                System.out.println(">>> Utilizator ADMIN creat: user=admin, pass=admin123");
            }
            
            if (userRepository.findByUsername("fermier").isEmpty()) {
                User farmer = new User();
                farmer.setUsername("fermier");
                farmer.setPassword(passwordEncoder.encode("fermier123"));
                farmer.setEmail("fermier@agro.com");
                farmer.setRole(UserRole.FARMER);
                
                userRepository.save(farmer);
                System.out.println(">>> Utilizator FARMER creat: user=fermier, pass=fermier123");
            }
        };
    }
}