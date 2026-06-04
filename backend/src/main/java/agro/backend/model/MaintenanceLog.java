package agro.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "maintenance_logs")
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @Column(nullable = false)
    private String description;

    private Double cost;

    private Integer hoursAtMaintenance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machinery_id", nullable = false)
    @JsonIgnore
    private Machinery machinery;
}
