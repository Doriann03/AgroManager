package agro.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "parcel_ndvi_history",
        uniqueConstraints = @UniqueConstraint(columnNames = {"parcel_id", "period_key"})
)
@Getter
@Setter
@NoArgsConstructor
public class ParcelNdviHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parcel_id", nullable = false)
    private Long parcelId;

    @Column(name = "period_key", nullable = false)
    private String periodKey;

    @Column(name = "ndvi_value", nullable = false)
    private Double ndviValue;

    @Column(name = "is_mock_data", nullable = false)
    private Boolean isMockData;

    @Transient
    private String dataSource;

    @Transient
    private String dataSourceLabel;
}
