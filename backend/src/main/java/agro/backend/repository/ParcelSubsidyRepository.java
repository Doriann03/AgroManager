package agro.backend.repository;

import agro.backend.model.ParcelSubsidy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParcelSubsidyRepository extends JpaRepository<ParcelSubsidy, Long> {
    @Query("""
            select ps from ParcelSubsidy ps
            join fetch ps.parcel p
            where p.farm.id = :farmId
              and ps.year = :year
            order by p.name asc, ps.subsidyType asc
            """)
    List<ParcelSubsidy> findAllByFarmAndYear(
            @Param("farmId") Long farmId,
            @Param("year") Integer year);
}
