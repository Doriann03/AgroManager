package agro.backend.controller;

import agro.backend.model.Activity;
import agro.backend.model.User;
import agro.backend.model.dto.ActivityRequestDTO;
import agro.backend.repository.UserRepository;
import agro.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

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
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost găsit: " + principal.getName()));
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<List<Activity>> getMyTasks(Principal principal) {
        User currentUser = getCurrentUser(principal);
        List<Activity> activities = activityService.getActivitiesByWorkerId(currentUser.getId());
        return ResponseEntity.ok(activities);
    }

    @GetMapping
    public ResponseEntity<List<Activity>> getAllActivities(Principal principal) {
        User currentUser = getCurrentUser(principal);
        if (currentUser.getFarm() == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Activity> activities = activityService.getActivitiesByFarmId(currentUser.getFarm().getId());
        return ResponseEntity.ok(activities);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            String newStatus = (String) body.get("status");
            String startDate = (String) body.get("startDate");
            String endDate = (String) body.get("endDate");
            String comments = (String) body.get("comments");
            Double harvestedYieldKg = null;
            
            Object yieldObj = body.get("harvestedYieldKg");
            if (yieldObj != null && !yieldObj.toString().trim().isEmpty()) {
                try {
                    harvestedYieldKg = Double.valueOf(yieldObj.toString());
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body("Cantitatea recoltată trebuie să fie un număr valid.");
                }
            }

            if (newStatus == null) {
                return ResponseEntity.badRequest().body("Statusul lipsește.");
            }
            Activity updatedActivity = activityService.updateActivityStatus(id, newStatus, startDate, endDate, comments, harvestedYieldKg, currentUser);
            return ResponseEntity.ok(updatedActivity);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/parcel/{parcelId}")
    public ResponseEntity<List<Activity>> getActivitiesForParcel(@PathVariable Long parcelId, Principal principal) {
        // Aici ar trebui adăugată o verificare de securitate pentru a asigura că utilizatorul are acces la parcela respectivă
        List<Activity> activities = activityService.getActivitiesByParcelId(parcelId);
        return ResponseEntity.ok(activities);
    }

    @PostMapping
    public ResponseEntity<Activity> createActivity(@RequestBody ActivityRequestDTO activityRequest, Principal principal) {
        User currentUser = getCurrentUser(principal);
        try {
            Activity savedActivity = activityService.createActivity(activityRequest, currentUser);
            return ResponseEntity.ok(savedActivity);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
