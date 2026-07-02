package agro.backend.controller;

import agro.backend.model.dto.ParcelSubsidyRequestDTO;
import agro.backend.model.dto.ParcelSubsidyResponseDTO;
import agro.backend.service.ParcelSubsidyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/subsidies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARM_MANAGER')")
public class ParcelSubsidyController {

    private final ParcelSubsidyService parcelSubsidyService;

    @GetMapping
    public ResponseEntity<List<ParcelSubsidyResponseDTO>> getSubsidies(
            @RequestParam(required = false) Integer year,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(parcelSubsidyService.getSubsidies(principal.getName(), year));
    }

    @PostMapping
    public ResponseEntity<ParcelSubsidyResponseDTO> createSubsidy(
            @Valid @RequestBody ParcelSubsidyRequestDTO request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(parcelSubsidyService.createSubsidy(principal.getName(), request));
    }

    @PutMapping("/{subsidyId}")
    public ResponseEntity<ParcelSubsidyResponseDTO> updateSubsidy(
            @PathVariable Long subsidyId,
            @Valid @RequestBody ParcelSubsidyRequestDTO request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(parcelSubsidyService.updateSubsidy(principal.getName(), subsidyId, request));
    }

    @DeleteMapping("/{subsidyId}")
    public ResponseEntity<Void> deleteSubsidy(
            @PathVariable Long subsidyId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        parcelSubsidyService.deleteSubsidy(principal.getName(), subsidyId);
        return ResponseEntity.noContent().build();
    }
}
