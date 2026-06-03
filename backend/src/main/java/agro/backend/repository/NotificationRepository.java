package agro.backend.repository;

import agro.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByDateCreatedDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
}
