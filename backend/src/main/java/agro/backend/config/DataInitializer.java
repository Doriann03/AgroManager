package agro.backend.config;

import agro.backend.model.Farm;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.repository.FarmRepository;
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
    private final FarmRepository farmRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // SUPER_ADMIN (fără fermă)
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setEmail("admin@agromanager.com");
                admin.setRole(UserRole.SUPER_ADMIN);
                userRepository.save(admin);
                System.out.println(">>> Utilizator SUPER_ADMIN creat: user=admin, pass=password");
            }
            
            // Creăm o fermă de test dacă nu există utilizatorul manager
            if (userRepository.findByUsername("manager").isEmpty()) {
                User manager = new User();
                manager.setUsername("manager");
                manager.setPassword(passwordEncoder.encode("password"));
                manager.setEmail("manager@agromanager.com");
                manager.setRole(UserRole.FARM_MANAGER);
                
                // Salvăm mai întâi managerul pentru a putea fi setat ca owner al fermei
                manager = userRepository.save(manager);
                
                Farm farm = new Farm();
                farm.setName("Ferma de Test");
                farm.setAddress("Str. Câmpului, Nr. 1");
                farm.setContactEmail("contact@fermatest.ro");
                farm.setCreatedBy(manager); // Aici avem nevoie de un user valid
                
                farm = farmRepository.save(farm);
                
                // Acum asociem managerul la fermă și salvăm din nou
                manager.setFarm(farm);
                userRepository.save(manager);
                System.out.println(">>> Utilizator FARM_MANAGER și Ferma de Test creat: user=manager, pass=password");
            }

            // Preluăm ferma de test pentru a o asocia celorlalți
            Farm testFarm = farmRepository.findByName("Ferma de Test").orElse(null);

            if (testFarm != null) {
                // AGRONOMIST (asociat cu ferma de test)
                if (userRepository.findByUsername("agronom").isEmpty()) {
                    User agronomist = new User();
                    agronomist.setUsername("agronom");
                    agronomist.setPassword(passwordEncoder.encode("password"));
                    agronomist.setEmail("agronom@agromanager.com");
                    agronomist.setRole(UserRole.AGRONOMIST);
                    agronomist.setFarm(testFarm);
                    userRepository.save(agronomist);
                    System.out.println(">>> Utilizator AGRONOMIST creat: user=agronom, pass=password");
                }

                // WORKER (asociat cu ferma de test)
                if (userRepository.findByUsername("muncitor").isEmpty()) {
                    User worker = new User();
                    worker.setUsername("muncitor");
                    worker.setPassword(passwordEncoder.encode("password"));
                    worker.setEmail("muncitor@agromanager.com");
                    worker.setRole(UserRole.WORKER);
                    worker.setFarm(testFarm);
                    userRepository.save(worker);
                    System.out.println(">>> Utilizator WORKER creat: user=muncitor, pass=password");
                }
            }
        };
    }
}
