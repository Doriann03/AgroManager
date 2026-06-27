package agro.backend.model.dto;

import agro.backend.model.ItemCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InventoryItemRequestDTO {

    @NotBlank(message = "Numele produsului este obligatoriu.")
    @Size(max = 120, message = "Numele produsului nu poate depasi 120 de caractere.")
    private String name;

    @NotNull(message = "Categoria produsului este obligatorie.")
    private ItemCategory category;

    @NotBlank(message = "Unitatea de masura este obligatorie.")
    @Size(max = 30, message = "Unitatea de masura nu poate depasi 30 de caractere.")
    private String unitOfMeasure;

    @NotNull(message = "Cantitatea disponibila este obligatorie.")
    @PositiveOrZero(message = "Cantitatea disponibila nu poate fi negativa.")
    private Double quantityAvailable;

    @PositiveOrZero(message = "Pragul minim de stoc nu poate fi negativ.")
    private Double minimumStockThreshold;

    @PositiveOrZero(message = "Pretul unitar nu poate fi negativ.")
    private Double unitPrice;
}
