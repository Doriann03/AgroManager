package agro.backend.model.dto;

import lombok.Data;

@Data
public class ConsumptionRequestDTO {
    private Long inventoryItemId;
    private Double quantityUsed;
}