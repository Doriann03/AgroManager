package agro.backend.repository;

import agro.backend.model.CropSeason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface CropSeasonRepository extends JpaRepository<CropSeason, Long> {
    List<CropSeason> findByParcelIdOrderByHarvestYearDesc(Long parcelId);
    List<CropSeason> findAllByParcelFarmId(Long farmId);
    Optional<CropSeason> findByParcelIdAndHarvestYear(Long parcelId, Integer harvestYear);

    @Query("""
            select cs from CropSeason cs
            join fetch cs.parcel p
            where p.farm.id = :farmId
              and cs.harvestYear = :year
            order by p.name asc
            """)
    List<CropSeason> findAllByFarmAndHarvestYear(
            @Param("farmId") Long farmId,
            @Param("year") Integer year);
}
