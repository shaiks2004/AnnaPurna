package com.annapurna.requirement;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RequirementCreateRequest(
        @NotNull UUID buyerProfileId,
        @NotNull UUID commodityId,
        @NotNull @DecimalMin(value = "0.001") @Digits(integer = 16, fraction = 3) BigDecimal quantity,
        @NotBlank @Size(max = 32) String quantityUnit,
        @NotBlank @Size(max = 512) String qualitySpecification,
        @NotBlank @Size(max = 512) String deliveryLocation,
        @NotNull LocalDate requiredBy,
        @DecimalMin(value = "0.00") @Digits(integer = 16, fraction = 4) BigDecimal targetPrice,
        @DecimalMin(value = "0.00") @Digits(integer = 16, fraction = 4) BigDecimal maximumPrice,
        @Size(min = 3, max = 3) String currencyCode,
        @Size(max = 2000) String notes) {
    @AssertTrue(message = "Required-by date must be in the future")
    public boolean requiredByIsInFuture() {
        return requiredBy != null && !requiredBy.isBefore(LocalDate.now());
    }

    @AssertTrue(message = "Maximum price must be greater than or equal to target price when both are present")
    public boolean pricesAreValid() {
        if (targetPrice == null || maximumPrice == null) {
            return true;
        }
        return maximumPrice.compareTo(targetPrice) >= 0;
    }
}
