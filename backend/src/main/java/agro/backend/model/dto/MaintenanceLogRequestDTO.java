package agro.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MaintenanceLogRequestDTO {

    @NotNull(message = "Data mentenantei este obligatorie.")
    private LocalDate date;

    @NotBlank(message = "Descrierea mentenantei este obligatorie.")
    @Size(max = 500, message = "Descrierea mentenantei nu poate depasi 500 de caractere.")
    private String description;

    @PositiveOrZero(message = "Costul mentenantei nu poate fi negativ.")
    private Double cost;

    @NotNull(message = "Orele la mentenanta sunt obligatorii.")
    @PositiveOrZero(message = "Orele la mentenanta nu pot fi negative.")
    private Integer hoursAtMaintenance;
}
