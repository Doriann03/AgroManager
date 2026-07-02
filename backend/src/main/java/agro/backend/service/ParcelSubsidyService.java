package agro.backend.service;

import agro.backend.model.Parcel;
import agro.backend.model.ParcelSubsidy;
import agro.backend.model.SubsidyStatus;
import agro.backend.model.User;
import agro.backend.model.dto.ParcelSubsidyRequestDTO;
import agro.backend.model.dto.ParcelSubsidyResponseDTO;
import agro.backend.repository.ParcelRepository;
import agro.backend.repository.ParcelSubsidyRepository;
import agro.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParcelSubsidyService {

    private final ParcelSubsidyRepository parcelSubsidyRepository;
    private final ParcelRepository parcelRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ParcelSubsidyResponseDTO> getSubsidies(String username, Integer requestedYear) {
        User currentUser = findUser(username);
        Long farmId = getFarmId(currentUser);
        int year = requestedYear != null ? requestedYear : LocalDate.now().getYear();

        return parcelSubsidyRepository.findAllByFarmAndYear(farmId, year)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public ParcelSubsidyResponseDTO createSubsidy(String username, ParcelSubsidyRequestDTO request) {
        User currentUser = findUser(username);
        Long farmId = getFarmId(currentUser);
        Parcel parcel = findFarmParcel(request.getParcelId(), farmId);

        ParcelSubsidy subsidy = new ParcelSubsidy();
        subsidy.setParcel(parcel);
        applyRequest(subsidy, request);
        return mapToDTO(parcelSubsidyRepository.save(subsidy));
    }

    @Transactional
    public ParcelSubsidyResponseDTO updateSubsidy(String username, Long subsidyId, ParcelSubsidyRequestDTO request) {
        User currentUser = findUser(username);
        Long farmId = getFarmId(currentUser);

        ParcelSubsidy subsidy = parcelSubsidyRepository.findById(subsidyId)
                .orElseThrow(() -> new RuntimeException("Subventia nu a fost gasita."));

        if (subsidy.getParcel() == null || subsidy.getParcel().getFarm() == null
                || !subsidy.getParcel().getFarm().getId().equals(farmId)) {
            throw new RuntimeException("Subventia nu apartine fermei curente.");
        }

        Parcel parcel = findFarmParcel(request.getParcelId(), farmId);
        subsidy.setParcel(parcel);
        applyRequest(subsidy, request);
        return mapToDTO(parcelSubsidyRepository.save(subsidy));
    }

    @Transactional
    public void deleteSubsidy(String username, Long subsidyId) {
        User currentUser = findUser(username);
        Long farmId = getFarmId(currentUser);

        ParcelSubsidy subsidy = parcelSubsidyRepository.findById(subsidyId)
                .orElseThrow(() -> new RuntimeException("Subventia nu a fost gasita."));

        if (subsidy.getParcel() == null || subsidy.getParcel().getFarm() == null
                || !subsidy.getParcel().getFarm().getId().equals(farmId)) {
            throw new RuntimeException("Subventia nu apartine fermei curente.");
        }

        parcelSubsidyRepository.delete(subsidy);
    }

    private void applyRequest(ParcelSubsidy subsidy, ParcelSubsidyRequestDTO request) {
        if (request.getYear() == null || request.getYear() < 2000 || request.getYear() > 2100) {
            throw new RuntimeException("Anul subventiei este invalid.");
        }

        String type = request.getSubsidyType() != null ? request.getSubsidyType().trim() : "";
        if (type.isBlank()) {
            throw new RuntimeException("Tipul subventiei este obligatoriu.");
        }

        double amountPerHectare = value(request.getAmountPerHectare());
        double totalAmount = request.getTotalAmount() != null
                ? request.getTotalAmount()
                : amountPerHectare * (subsidy.getParcel() != null ? subsidy.getParcel().getAreaHectares() : 0.0);

        if (amountPerHectare < 0 || totalAmount < 0) {
            throw new RuntimeException("Valorile subventiei nu pot fi negative.");
        }

        subsidy.setYear(request.getYear());
        subsidy.setSubsidyType(type);
        subsidy.setAmountPerHectare(amountPerHectare);
        subsidy.setTotalAmount(totalAmount);
        subsidy.setStatus(request.getStatus() != null ? request.getStatus() : SubsidyStatus.ESTIMATED);
        subsidy.setNotes(trimToNull(request.getNotes()));
    }

    private Parcel findFarmParcel(Long parcelId, Long farmId) {
        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new RuntimeException("Parcela nu a fost gasita."));

        if (parcel.getFarm() == null || !parcel.getFarm().getId().equals(farmId)) {
            throw new RuntimeException("Parcela nu apartine fermei curente.");
        }
        return parcel;
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit."));
    }

    private Long getFarmId(User user) {
        if (user.getFarm() == null) {
            throw new RuntimeException("Utilizatorul nu este asociat cu nicio ferma.");
        }
        return user.getFarm().getId();
    }

    private ParcelSubsidyResponseDTO mapToDTO(ParcelSubsidy subsidy) {
        Parcel parcel = subsidy.getParcel();
        ParcelSubsidyResponseDTO dto = new ParcelSubsidyResponseDTO();
        dto.setId(subsidy.getId());
        dto.setParcelId(parcel != null ? parcel.getId() : null);
        dto.setParcelName(parcel != null ? parcel.getName() : "-");
        dto.setParcelAreaHectares(parcel != null ? parcel.getAreaHectares() : 0.0);
        dto.setYear(subsidy.getYear());
        dto.setSubsidyType(subsidy.getSubsidyType());
        dto.setAmountPerHectare(subsidy.getAmountPerHectare());
        dto.setTotalAmount(subsidy.getTotalAmount());
        dto.setStatus(subsidy.getStatus());
        dto.setNotes(subsidy.getNotes());
        return dto;
    }

    private double value(Double number) {
        return number != null ? number : 0.0;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
