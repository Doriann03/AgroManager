package agro.backend.repository;

import agro.backend.model.FarmNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FarmNoteRepository extends JpaRepository<FarmNote, Long> {
    List<FarmNote> findByFarmIdOrderByDateCreatedDesc(Long farmId);
}
