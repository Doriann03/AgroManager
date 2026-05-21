package agro.backend.repository;

import agro.backend.model.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    // Caută parcelele bazându-se pe ID-ul fermei
    List<Parcel> findAllByFarmId(Long farmId);
}