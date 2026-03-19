package agro.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crop_seasons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CropSeason {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer harvestYear; // Anul de recoltă (ex: 2024)

    @Column(nullable = false)
    private String cropType; // Tipul culturii (ex: "Porumb")

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parcel_id", nullable = false)
    private Parcel parcel;
}
