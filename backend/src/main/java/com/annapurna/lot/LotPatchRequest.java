package com.annapurna.lot;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LotPatchRequest(
        @DecimalMin(value = "0.001") @Digits(integer = 16, fraction = 3) BigDecimal quantity,
        @Size(max = 32) String quantityUnit,
        LocalDate harvestDate,
        LocalDate availableFrom) {
    public boolean hasChanges() {
        return quantity != null || quantityUnit != null || harvestDate != null || availableFrom != null;
    }
}