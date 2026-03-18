package agro.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

    @ManyToMany
    @JoinTable(
        name = "activity_machinery", // Numele tabelei de legătură
        joinColumns = @JoinColumn(name = "activity_id"), // Cheia spre Activity
        inverseJoinColumns = @JoinColumn(name = "machinery_id") // Cheia spre Machinery
    )
    private Set<Machinery> machineries = new HashSet<>(); // Folosim o colecție pentru a stoca mai multe utilaje
}
