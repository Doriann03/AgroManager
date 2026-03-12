package agro.backend.controller;

import agro.backend.model.Parcel;
import agro.backend.service.ParcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parcels")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Permite accesul din React (Vite)
public class ParcelController {

    private final ParcelService parcelService;

    @GetMapping
    public List<Parcel> getAll() {
        return parcelService.getAllParcels();
    }

    @PostMapping
    public Parcel create(@RequestBody Parcel parcel) {
        return parcelService.saveParcel(parcel);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        parcelService.deleteParcel(id);
    }
}