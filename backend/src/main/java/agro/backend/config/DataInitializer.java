package agro.backend.config;

import agro.backend.model.Farm;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.repository.FarmRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo-data.enabled:false}")
    private boolean demoDataEnabled;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            normalizeExistingUsernames();

            if (!demoDataEnabled) {
                return;
            }

            seedDemoUsersAndFarm();
        };
    }

    private void seedDemoUsersAndFarm() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setEmail("admin@agromanager.com");
            admin.setRole(UserRole.SUPER_ADMIN);
            userRepository.save(admin);
            logger.info("Demo SUPER_ADMIN created: user=admin");
        }

        if (userRepository.findByUsername("manager").isEmpty()) {
            User manager = new User();
            manager.setUsername("manager");
            manager.setPassword(passwordEncoder.encode("password"));
            manager.setEmail("manager@agromanager.com");
            manager.setRole(UserRole.FARM_MANAGER);
            manager = userRepository.save(manager);

            Farm farm = new Farm();
            farm.setName("Ferma de Test");
            farm.setAddress("Str. Campului, Nr. 1");
            farm.setContactEmail("contact@fermatest.ro");
            farm.setCreatedBy(manager);
            farm = farmRepository.save(farm);

            manager.setFarm(farm);
            userRepository.save(manager);
            logger.info("Demo FARM_MANAGER and farm created: user=manager");
        }

        Farm testFarm = farmRepository.findByName("Ferma de Test").orElse(null);
        if (testFarm == null) {
            return;
        }

        if (userRepository.findByUsername("agronom").isEmpty()) {
            User agronomist = new User();
            agronomist.setUsername("agronom");
            agronomist.setPassword(passwordEncoder.encode("password"));
            agronomist.setEmail("agronom@agromanager.com");
            agronomist.setRole(UserRole.AGRONOMIST);
            agronomist.setMonthlySalary(10000.0);
            agronomist.setFarm(testFarm);
            userRepository.save(agronomist);
            logger.info("Demo AGRONOMIST created: user=agronom");
        }

        if (userRepository.findByUsername("muncitor").isEmpty()) {
            User worker = new User();
            worker.setUsername("muncitor");
            worker.setPassword(passwordEncoder.encode("password"));
            worker.setEmail("muncitor@agromanager.com");
            worker.setRole(UserRole.WORKER);
            worker.setHourlyRate(30.0);
            worker.setFarm(testFarm);
            userRepository.save(worker);
            logger.info("Demo WORKER created: user=muncitor");
        }
    }

    private void normalizeExistingUsernames() {
        userRepository.findAll().forEach(user -> {
            String username = user.getUsername();
            if (username == null) {
                return;
            }

            String normalizedUsername = username.trim();
            if (normalizedUsername.isEmpty() || normalizedUsername.equals(username)) {
                return;
            }

            if (userRepository.existsByUsername(normalizedUsername)) {
                logger.warn("Username normalization skipped because of collision: '{}'", username);
                return;
            }

            user.setUsername(normalizedUsername);
            userRepository.save(user);
            logger.info("Username normalized: '{}' -> '{}'", username, normalizedUsername);
        });
    }
}
