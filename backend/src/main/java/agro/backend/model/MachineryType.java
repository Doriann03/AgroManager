package agro.backend.model;

import lombok.Getter;

@Getter
public enum MachineryType {
    TRACTOR("Tractor"),
    COMBINA("Combină"),
    SEMANATOARE("Semănătoare"),
    PLUG("Plug"),
    DISC("Disc"),
    PULVERIZATOR("Pulverizator"),
    ALTELE("Altele");

    private final String label;

    MachineryType(String label) {
        this.label = label;
    }
}
