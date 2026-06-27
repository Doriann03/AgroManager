package agro.backend.model.dto;

import agro.backend.model.ItemCategory;
import agro.backend.model.MachineryType;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class RequestDtoValidationTests {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void parcelRequestRejectsBlankNameAndNegativeArea() {
        ParcelRequestDTO request = new ParcelRequestDTO();
        request.setName(" ");
        request.setAreaHectares(-1.0);
        request.setCoordinatesJson("[]");

        Set<String> fields = invalidFields(request);

        assertThat(fields).contains("name", "areaHectares");
    }

    @Test
    void inventoryRequestRejectsNegativeQuantity() {
        InventoryItemRequestDTO request = new InventoryItemRequestDTO();
        request.setName("Fertilizant");
        request.setCategory(ItemCategory.FERTILIZER);
        request.setUnitOfMeasure("kg");
        request.setQuantityAvailable(-0.1);
        request.setUnitPrice(10.0);

        Set<String> fields = invalidFields(request);

        assertThat(fields).containsExactly("quantityAvailable");
    }

    @Test
    void inventoryRequestRejectsNegativeMinimumStockThreshold() {
        InventoryItemRequestDTO request = new InventoryItemRequestDTO();
        request.setName("Fertilizant");
        request.setCategory(ItemCategory.FERTILIZER);
        request.setUnitOfMeasure("kg");
        request.setQuantityAvailable(100.0);
        request.setMinimumStockThreshold(-1.0);

        Set<String> fields = invalidFields(request);

        assertThat(fields).containsExactly("minimumStockThreshold");
    }

    @Test
    void machineryRequestRejectsNegativeHoursAndZeroMaintenanceInterval() {
        MachineryRequestDTO request = new MachineryRequestDTO();
        request.setName("Tractor");
        request.setType(MachineryType.TRACTOR);
        request.setTotalHours(-1);
        request.setMaintenanceIntervalHours(0);

        Set<String> fields = invalidFields(request);

        assertThat(fields).contains("totalHours", "maintenanceIntervalHours");
    }

    @Test
    void maintenanceLogRequestRejectsMissingDateBlankDescriptionAndNegativeCost() {
        MaintenanceLogRequestDTO request = new MaintenanceLogRequestDTO();
        request.setDate(null);
        request.setDescription(" ");
        request.setCost(-1.0);
        request.setHoursAtMaintenance(100);

        Set<String> fields = invalidFields(request);

        assertThat(fields).contains("date", "description", "cost");
    }

    @Test
    void maintenanceLogRequestAcceptsValidPayload() {
        MaintenanceLogRequestDTO request = new MaintenanceLogRequestDTO();
        request.setDate(LocalDate.now());
        request.setDescription("Schimb ulei");
        request.setCost(250.0);
        request.setHoursAtMaintenance(500);

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void activityRequestRejectsNegativeConsumptionQuantity() {
        ConsumptionRequestDTO consumption = new ConsumptionRequestDTO();
        consumption.setInventoryItemId(1L);
        consumption.setQuantityUsed(-200.0);

        ActivityRequestDTO request = new ActivityRequestDTO();
        request.setTitle("Semanat grau");
        request.setParcelId(1L);
        request.setAssignedWorkerIds(List.of(1L));
        request.setConsumptions(List.of(consumption));

        Set<String> fields = invalidFields(request);

        assertThat(fields).anyMatch(field -> field.endsWith("quantityUsed"));
    }

    @Test
    void activityStatusUpdateRejectsNegativeActualConsumptionQuantity() {
        ConsumptionRequestDTO consumption = new ConsumptionRequestDTO();
        consumption.setInventoryItemId(1L);
        consumption.setQuantityUsed(-10.0);

        ActivityStatusUpdateRequestDTO request = new ActivityStatusUpdateRequestDTO();
        request.setStatus("COMPLETED");
        request.setActualConsumptions(List.of(consumption));

        Set<String> fields = invalidFields(request);

        assertThat(fields).anyMatch(field -> field.endsWith("quantityUsed"));
    }

    private Set<String> invalidFields(Object request) {
        return validator.validate(request)
                .stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(Collectors.toSet());
    }
}
