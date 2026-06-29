package agro.backend.repository;

import agro.backend.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {

    @Query("""
            select coalesce(sum(ml.cost), 0)
            from MaintenanceLog ml
            where ml.machinery.farm.id = :farmId
              and ml.date is not null
              and year(ml.date) = :year
            """)
    Double sumCostByFarmAndYear(@Param("farmId") Long farmId, @Param("year") Integer year);
}
