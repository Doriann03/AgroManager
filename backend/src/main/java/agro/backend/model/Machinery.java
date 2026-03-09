package agro.backend.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "machinery")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Machinery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brandModel;
    private String licensePlate;
    private Integer workHours;

    @Enumerated(EnumType.STRING)
    private MachineryStatus status; // Creează un Enum separat (ACTIVE, REPAIR)
}