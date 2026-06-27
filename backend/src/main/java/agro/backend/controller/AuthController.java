package agro.backend.controller;

import agro.backend.model.Farm;
import agro.backend.model.User;
import agro.backend.model.UserRole;
import agro.backend.model.dto.LoginRequest;
import agro.backend.model.dto.LoginResponse;
import agro.backend.model.dto.RegisterRequest;
import agro.backend.repository.FarmRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String username = loginRequest.getUsername() != null ? loginRequest.getUsername().trim() : "";

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        HttpSession session = request.getSession(true);
        session.setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
            SecurityContextHolder.getContext()
        );

        User user = (User) authentication.getPrincipal();
        
        Long farmId = user.getFarm() != null ? user.getFarm().getId() : null;
        String farmName = user.getFarm() != null ? user.getFarm().getName() : null;

        return ResponseEntity.ok(new LoginResponse(user.getId(), user.getUsername(), user.getRole(), farmId, farmName));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        String username = registerRequest.getUsername() != null ? registerRequest.getUsername().trim() : "";
        String email = registerRequest.getEmail() != null ? registerRequest.getEmail().trim() : null;

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Eroare: Numele de utilizator este deja folosit!");
        }

        // 1. Creăm și salvăm utilizatorul (managerul) FĂRĂ fermă
        User manager = new User();
        manager.setUsername(username);
        manager.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        manager.setEmail(email);
        manager.setRole(UserRole.FARM_MANAGER);
        User savedManager = userRepository.save(manager);

        // 2. Creăm ferma și o legăm de managerul deja salvat
        Farm farm = new Farm();
        farm.setName(registerRequest.getFarmName());
        farm.setAddress(registerRequest.getFarmAddress());
        farm.setContactEmail(registerRequest.getFarmContactEmail() != null ? registerRequest.getFarmContactEmail().trim() : email);
        farm.setCreatedBy(savedManager);
        Farm savedFarm = farmRepository.save(farm);

        // 3. Actualizăm managerul cu ferma creată și salvăm din nou
        savedManager.setFarm(savedFarm);
        userRepository.save(savedManager);

        return ResponseEntity.ok("Utilizator și fermă înregistrate cu succes!");
    }
}
