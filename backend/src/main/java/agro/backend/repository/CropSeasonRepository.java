package agro.backend.repository;

import agro.backend.model.CropSeason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropSeasonRepository extends JpaRepository<CropSeason, Long> {
    List<CropSeason> findByParcelIdOrderByHarvestYearDesc(Long parcelId);
}