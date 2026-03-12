package agro.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "parcels")
@Getter
@Setter
public class Parcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String cropType;

    private double areaHectares;

    @Lob // Specifică un câmp de tip Large Object, potrivit pentru JSON lung
    @Column(columnDefinition = "TEXT")
    private String coordinatesJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // Ignorăm owner-ul la serializare pentru a nu crea bucle infinite
    private User owner;
}