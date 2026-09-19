package com.annapurna.lot;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LotCreateRequest(
        @NotBlank @Size(max = 64) String lotNumber,
        @NotNull UUID commodityId,
        UUID sourceSupplyId,
        UUID farmerId,
        UUID organizationId,
        @NotNull @DecimalMin(value = "0.001") @Digits(integer = 16, fraction = 3) BigDecimal quantity,
        @NotBlank @Size(max = 32) String quantityUnit,
        LocalDate harvestDate,
        LocalDate availableFrom) {
    @AssertTrue(message = "Exactly one farmer or organization supplier is required")
    public boolean hasExactlyOneSupplier() {
        return (farmerId != null) != (organizationId != null);
    }
}