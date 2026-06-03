package agro.backend.repository;

import agro.backend.model.CropSeason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface CropSeasonRepository extends JpaRepository<CropSeason, Long> {
    List<CropSeason> findByParcelIdOrderByHarvestYearDesc(Long parcelId);
    List<CropSeason> findAllByParcelFarmId(Long farmId);
    Optional<CropSeason> findByParcelIdAndHarvestYear(Long parcelId, Integer harvestYear);
}