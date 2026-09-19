package com.annapurna.supply;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SupplyResponse(
        UUID id,
        UUID commodityId,
        UUID farmerId,
        UUID organizationId,
        SupplyKind supplyKind,
        BigDecimal quantity,
        String quantityUnit,
        LocalDate expectedHarvestDate,
        LocalDate availableFrom) {
    public static SupplyResponse from(Supply supply) {
        return new SupplyResponse(
                supply.getId(),
                supply.getCommodity().getId(),
                supply.getFarmer() == null ? null : supply.getFarmer().getId(),
                supply.getOrganization() == null ? null : supply.getOrganization().getId(),
                supply.getSupplyKind(),
                supply.getQuantity(),
                supply.getQuantityUnit(),
                supply.getExpectedHarvestDate(),
                supply.getAvailableFrom());
    }
}