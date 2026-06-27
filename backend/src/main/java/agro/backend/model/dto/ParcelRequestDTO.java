package agro.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ParcelRequestDTO {

    @NotBlank(message = "Numele parcelei este obligatoriu.")
    @Size(max = 120, message = "Numele parcelei nu poate depasi 120 de caractere.")
    private String name;

    @Size(max = 80, message = "Tipul culturii nu poate depasi 80 de caractere.")
    private String cropType;

    @NotNull(message = "Suprafata parcelei este obligatorie.")
    @Positive(message = "Suprafata parcelei trebuie sa fie mai mare decat 0.")
    private Double areaHectares;

    @NotBlank(message = "Coordonatele parcelei sunt obligatorii.")
    private String coordinatesJson;
}
