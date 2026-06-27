package agro.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InventoryItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemCategory category;

    @Column(nullable = false)
    private String unitOfMeasure;

    @Column(nullable = false)
    private Double quantityAvailable;

    @Column(name = "minimum_stock_threshold")
    private Double minimumStockThreshold = 0.0;

    private Double unitPrice;

    // Un produs din magazie aparține unei ferme, nu unui utilizator individual
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    @JsonIgnore
    private Farm farm;
}
