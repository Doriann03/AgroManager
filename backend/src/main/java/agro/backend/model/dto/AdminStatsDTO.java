package agro.backend.model.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AdminStatsDTO {
    private Integer totalFarms;
    private Integer totalUsers;
    private Integer managers;
    private Integer agronomists;
    private Integer workers;
    private Integer superAdmins;
    private Integer totalParcels;
    private List<AdminFarmDTO> recentFarms = new ArrayList<>();
}
