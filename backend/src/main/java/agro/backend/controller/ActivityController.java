package agro.backend.controller;

import agro.backend.model.Activity;
import agro.backend.model.dto.ActivityRequestDTO;
import agro.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    // Obține toate activitățile pentru o anumită parcelă
    @GetMapping("/parcel/{parcelId}")
    public ResponseEntity<List<Activity>> getActivitiesForParcel(@PathVariable Long parcelId, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        // (Opțional: verifică dacă parcela aparține user-ului curent)
        List<Activity> activities = activityService.getActivitiesByParcelId(parcelId);
        return ResponseEntity.ok(activities);
    }

    // Creează o nouă activitate
    @PostMapping
    public ResponseEntity<Activity> createActivity(@RequestBody ActivityRequestDTO activityRequest, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            Activity savedActivity = activityService.createActivity(activityRequest, principal.getName());
            return ResponseEntity.ok(savedActivity);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}