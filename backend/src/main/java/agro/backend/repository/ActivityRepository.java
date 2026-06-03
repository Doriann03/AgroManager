package agro.backend.repository;

import agro.backend.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByParcelId(Long parcelId);
    List<Activity> findByAssignedWorkers_Id(Long workerId);
    List<Activity> findByParcel_Farm_IdOrderByStartDateDesc(Long farmId);
}