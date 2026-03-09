package agro.backend.model;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDateTime startDate;

    @ManyToOne
    @JoinColumn(name = "parcel_id")
    private Parcel parcel;

    @ManyToOne
    @JoinColumn(name = "machinery_id")
    private Machinery machinery;
}