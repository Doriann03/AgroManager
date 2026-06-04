package agro.backend.model;

import lombok.Getter;

@Getter
public enum MachineryStatus {
    DISPONIBIL("Disponibil"),
    IN_CURSA("În Cursă"),
    IN_SERVICE("În Service");

    private final String label;

    MachineryStatus(String label) {
        this.label = label;
    }
}
