package agro.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "farms")
@Getter
@Setter
@NoArgsConstructor
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String address;

    private String contactEmail;

    @Column(columnDefinition = "TEXT")
    private String visionAndGoals;

    // Cine a creat/este proprietarul principal al fermei (de obicei FARM_MANAGER)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", unique = true)
    @JsonIgnore // Evităm bucle infinite în JSON
    private User createdBy;
}
