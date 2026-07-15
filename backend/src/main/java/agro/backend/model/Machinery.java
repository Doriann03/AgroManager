package agro.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "machinery")
@Getter
@Setter
public class Machinery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String model;

    private String licensePlate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MachineryType type = MachineryType.ALTELE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MachineryStatus status = MachineryStatus.DISPONIBIL;

    @Column(name = "total_hours")
    private Integer totalHours;

    @Column(name = "maintenance_interval_hours")
    private Integer maintenanceIntervalHours;

    @Column(name = "next_maintenance_hours")
    private Integer nextMaintenanceHours;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    private LocalDate purchaseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    @JsonIgnore
    private Farm farm;

    @OneToMany(mappedBy = "machinery", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("machinery")
    private List<MaintenanceLog> maintenanceLogs = new ArrayList<>();
}
