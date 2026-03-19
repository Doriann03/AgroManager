package agro.backend.controller;

import agro.backend.model.Machinery;
import agro.backend.service.MachineryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/machinery")
@RequiredArgsConstructor
public class MachineryController {

    private final MachineryService machineryService;

    @GetMapping
    public ResponseEntity<List<Machinery>> getMyMachinery(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        List<Machinery> machineryList = machineryService.getMachineryByUsername(principal.getName());
        return ResponseEntity.ok(machineryList);
    }

    @PostMapping
    public ResponseEntity<Machinery> create(@RequestBody Machinery machinery, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        Machinery savedMachinery = machineryService.saveMachinery(machinery, principal.getName());
        return ResponseEntity.ok(savedMachinery);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Machinery> update(@PathVariable Long id, @RequestBody Machinery machinery, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            Machinery updatedMachinery = machineryService.updateMachinery(id, machinery, principal.getName());
            return ResponseEntity.ok(updatedMachinery);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        machineryService.deleteMachinery(id);
        return ResponseEntity.noContent().build();
    }
}