package agro.backend.repository;

import agro.backend.model.User;
import agro.backend.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    List<User> findAllByFarmId(Long farmId);
    
    @Query("SELECT u FROM User u WHERE u.farm.id = :farmId AND u.role IN :roles")
    List<User> findByFarmIdAndRoleIn(@Param("farmId") Long farmId, @Param("roles") List<UserRole> roles);
}
