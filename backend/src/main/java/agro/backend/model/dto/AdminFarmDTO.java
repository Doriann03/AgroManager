package agro.backend.model.dto;

import lombok.Data;

@Data
public class AdminFarmDTO {
    private Long id;
    private String name;
    private String address;
    private String contactEmail;
    private String managerUsername;
    private Integer userCount;
    private Integer parcelCount;
}
