package agro.backend.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminFarmUpdateRequestDTO {
    private String name;
    private String address;
    private String contactEmail;
}
