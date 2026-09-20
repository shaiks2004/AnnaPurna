package com.annapurna.supply;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SupplyPatchRequest(
        SupplyKind supplyKind,
        @DecimalMin(value = "0.001") @Digits(integer = 16, fraction = 3) BigDecimal quantity,
        @Size(max = 32) String quantityUnit,
        LocalDate expectedHarvestDate,
        LocalDate availableFrom) {
    public boolean hasChanges() {
        return supplyKind != null
                || quantity != null
                || quantityUnit != null
                || expectedHarvestDate != null
                || availableFrom != null;
    }
}