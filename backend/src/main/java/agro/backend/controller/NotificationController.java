package agro.backend.controller;

import agro.backend.model.Notification;
import agro.backend.model.User;
import agro.backend.repository.UserRepository;
import agro.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        if (principal == null) throw new UsernameNotFoundException("Nu sunteți autentificat.");
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizator negăsit."));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Principal principal) {
        User user = getCurrentUser(principal);
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        User user = getCurrentUser(principal);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }
}
