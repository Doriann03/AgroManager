package agro.backend.repository;

import agro.backend.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findAllByFarmId(Long farmId);
    Optional<InventoryItem> findByFarmIdAndNameIgnoreCase(Long farmId, String name);
}