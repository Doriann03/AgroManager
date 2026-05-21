package agro.backend.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String farmName; // Adăugat pentru a crea o fermă la înregistrarea managerului
    private String farmAddress; // Adăugat pentru detalii fermă
    private String farmContactEmail; // Adăugat pentru detalii fermă
}