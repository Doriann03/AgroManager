package agro.backend.repository;

import agro.backend.model.InventoryRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryRequestRepository extends JpaRepository<InventoryRequest, Long> {
    List<InventoryRequest> findByFarmIdOrderByDateCreatedDesc(Long farmId);
}
