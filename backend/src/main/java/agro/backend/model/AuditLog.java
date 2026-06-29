package agro.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorId;

    private String actorUsername;

    private String action;

    private String targetType;

    private Long targetId;

    private String targetName;

    @Column(length = 1000)
    private String details;

    private LocalDateTime createdAt = LocalDateTime.now();
}
