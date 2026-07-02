package agro.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "parcel_subsidies")
@Getter
@Setter
@NoArgsConstructor
public class ParcelSubsidy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parcel_id", nullable = false)
    @JsonIgnore
    private Parcel parcel;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String subsidyType;

    private Double amountPerHectare;

    @Column(nullable = false)
    private Double totalAmount = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubsidyStatus status = SubsidyStatus.ESTIMATED;

    @Column(length = 1000)
    private String notes;
}
