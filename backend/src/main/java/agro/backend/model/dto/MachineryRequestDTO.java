package agro.backend.model.dto;

import agro.backend.model.MachineryStatus;
import agro.backend.model.MachineryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MachineryRequestDTO {

    @NotBlank(message = "Numele utilajului este obligatoriu.")
    @Size(max = 120, message = "Numele utilajului nu poate depasi 120 de caractere.")
    private String name;

    @Size(max = 80, message = "Modelul utilajului nu poate depasi 80 de caractere.")
    private String model;

    @Size(max = 30, message = "Numarul de inmatriculare nu poate depasi 30 de caractere.")
    private String licensePlate;

    @NotNull(message = "Tipul utilajului este obligatoriu.")
    private MachineryType type;

    private MachineryStatus status;

    @PositiveOrZero(message = "Orele totale nu pot fi negative.")
    private Integer totalHours;

    @Positive(message = "Intervalul de mentenanta trebuie sa fie mai mare decat 0.")
    private Integer maintenanceIntervalHours;

    private LocalDate purchaseDate;
}
