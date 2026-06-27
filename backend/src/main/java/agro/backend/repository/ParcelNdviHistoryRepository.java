package agro.backend.repository;

import agro.backend.model.ParcelNdviHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParcelNdviHistoryRepository extends JpaRepository<ParcelNdviHistory, Long> {
    Optional<ParcelNdviHistory> findByParcelIdAndPeriodKey(Long parcelId, String periodKey);
}
