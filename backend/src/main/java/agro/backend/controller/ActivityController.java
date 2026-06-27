package agro.backend.controller;

import agro.backend.model.Activity;
import agro.backend.model.User;
import agro.backend.model.dto.ActivityRequestDTO;
import agro.backend.model.dto.ActivityStatusUpdateRequestDTO;
import agro.backend.repository.UserRepository;
import agro.backend.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new UsernameNotFoundException("Utilizatorul nu este autentificat.");
        }
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost gasit: " + principal.getName()));
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<List<Activity>> getMyTasks(Principal principal) {
        User currentUser = getCurrentUser(principal);
        List<Activity> activities = activityService.getActivitiesByWorkerId(currentUser.getId());
        return ResponseEntity.ok(activities);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<List<Activity>> getAllActivities(Principal principal) {
        User currentUser = getCurrentUser(principal);
        if (currentUser.getFarm() == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Activity> activities = activityService.getActivitiesByFarmId(currentUser.getFarm().getId());
        return ResponseEntity.ok(activities);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @Valid @RequestBody ActivityStatusUpdateRequestDTO request, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Activity updatedActivity = activityService.updateActivityStatus(
                    id,
                    request.getStatus(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getComments(),
                    request.getHarvestedYieldKg(),
                    request.getActualConsumptions(),
                    currentUser);
            return ResponseEntity.ok(updatedActivity);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/parcel/{parcelId}")
    @PreAuthorize("hasAnyRole('FARM_MANAGER', 'AGRONOMIST')")
    public ResponseEntity<List<Activity>> getActivitiesForParcel(@PathVariable Long parcelId, Principal principal) {
        User currentUser = getCurrentUser(principal);
        List<Activity> activities = activityService.getActivitiesByParcelId(parcelId, currentUser);
        return ResponseEntity.ok(activities);
    }

    @PostMapping
    @PreAuthorize("hasRole('AGRONOMIST')")
    public ResponseEntity<Activity> createActivity(@Valid @RequestBody ActivityRequestDTO activityRequest, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Activity savedActivity = activityService.createActivity(activityRequest, currentUser);
            return ResponseEntity.ok(savedActivity);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
