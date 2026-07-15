package agro.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crop_seasons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CropSeason {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer harvestYear;

    @Column(nullable = false)
    private String cropType;

    private Double totalYieldKg;

    private Double salePricePerKg;

    private Double revenueOverride;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parcel_id", nullable = false)
    private Parcel parcel;
}
