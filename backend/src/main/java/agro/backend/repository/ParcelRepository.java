package agro.backend.repository;

import agro.backend.model.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    // Spring va genera automat metode precum save(), findAll(), findById()
    // Caută parcelele bazându-se pe proprietatea 'username' a obiectului 'owner'
    List<Parcel> findAllByOwnerUsername(String username);
}