package com.annapurna.requirement;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RequirementPatchRequest(
        BigDecimal quantity,
    @Size(max = 32) String quantityUnit,
    @Size(max = 512) String qualitySpecification,
    @Size(max = 512) String deliveryLocation,
        LocalDate requiredBy,
        @DecimalMin(value = "0.00") @Digits(integer = 16, fraction = 4) BigDecimal targetPrice,
        @DecimalMin(value = "0.00") @Digits(integer = 16, fraction = 4) BigDecimal maximumPrice,
        @Size(min = 3, max = 3) String currencyCode,
        @Size(max = 2000) String notes) {
    public boolean hasChanges() {
        return quantity != null
                || quantityUnit != null
                || qualitySpecification != null
                || deliveryLocation != null
                || requiredBy != null
                || targetPrice != null
                || maximumPrice != null
                || currencyCode != null
                || notes != null;
    }
}