package agro.backend.model.dto;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class CropSeasonFinancialRequestDTO {

    @PositiveOrZero(message = "Pretul de vanzare nu poate fi negativ.")
    private Double salePricePerKg;

    @PositiveOrZero(message = "Venitul total nu poate fi negativ.")
    private Double revenueOverride;
}
