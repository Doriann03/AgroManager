package agro.backend.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parcels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Parcel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double areaHectares;
    private String cropType;

    @Column(columnDefinition = "TEXT") // TEXT permite stocarea unui șir lung de coordonate
    private String coordinatesJson;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;
}