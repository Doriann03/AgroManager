package agro.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ConsumptionRequestDTO {

    @NotNull(message = "Produsul consumabil este obligatoriu.")
    private Long inventoryItemId;

    @NotNull(message = "Cantitatea consumata este obligatorie.")
    @Positive(message = "Cantitatea consumata trebuie sa fie mai mare decat 0.")
    private Double quantityUsed;
}
