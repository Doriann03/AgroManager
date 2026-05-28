package agro.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
        name = "activity_workers",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> assignedWorkers = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "activity_machinery", 
        joinColumns = @JoinColumn(name = "activity_id"), 
        inverseJoinColumns = @JoinColumn(name = "machinery_id") 
    )
    private Set<Machinery> machineries = new HashSet<>();

    // Legătura cu consumurile
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("activity") // Pentru a preveni bucle infinite in JSON
    private List<ActivityConsumption> consumptions = new ArrayList<>();
}