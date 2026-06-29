package agro.backend.repository;

import agro.backend.model.Activity;
import agro.backend.model.ActivityStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByParcelId(Long parcelId);
    List<Activity> findByAssignedWorkers_Id(Long workerId);
    List<Activity> findByParcel_Farm_IdOrderByStartDateDesc(Long farmId);

    @Query("""
            select distinct a from Activity a
            left join fetch a.consumptions c
            left join fetch c.inventoryItem
            where a.parcel.farm.id = :farmId
              and a.status = :status
              and (
                    (a.endDate is not null and year(a.endDate) = :year)
                    or (a.endDate is null and a.startDate is not null and year(a.startDate) = :year)
                  )
            """)
    List<Activity> findWithConsumptionsByFarmAndStatusAndYear(
            @Param("farmId") Long farmId,
            @Param("status") ActivityStatus status,
            @Param("year") Integer year);

    @Query("""
            select distinct a from Activity a
            join a.assignedWorkers worker
            left join fetch a.parcel
            where worker.id = :workerId
              and a.status = :status
              and (
                    (a.endDate is not null and a.endDate >= :startDate and a.endDate < :endDate)
                    or (a.endDate is null and a.startDate is not null and a.startDate >= :startDate and a.startDate < :endDate)
                  )
            """)
    List<Activity> findWorkerActivitiesByStatusAndDateRange(
            @Param("workerId") Long workerId,
            @Param("status") ActivityStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("""
            select distinct a from Activity a
            left join fetch a.assignedWorkers
            left join fetch a.parcel
            where a.parcel.farm.id = :farmId
              and a.status = :status
              and (
                    (a.endDate is not null and a.endDate >= :startDate and a.endDate < :endDate)
                    or (a.endDate is null and a.startDate is not null and a.startDate >= :startDate and a.startDate < :endDate)
                  )
            """)
    List<Activity> findFarmActivitiesByStatusAndDateRange(
            @Param("farmId") Long farmId,
            @Param("status") ActivityStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
