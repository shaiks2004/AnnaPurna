package com.annapurna.lot;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LotResponse(
        UUID id,
        String lotNumber,
        UUID commodityId,
        UUID sourceSupplyId,
        UUID farmerId,
        UUID organizationId,
        BigDecimal quantity,
        String quantityUnit,
        LocalDate harvestDate,
        LocalDate availableFrom,
        LotStatus status) {
    public static LotResponse from(Lot lot) {
        if (lot == null) {
            throw new IllegalArgumentException("Lot is required");
        }
        return new LotResponse(
                lot.getId(),
                lot.getLotNumber(),
                lot.getCommodity() == null ? null : lot.getCommodity().getId(),
                lot.getSourceSupply() == null ? null : lot.getSourceSupply().getId(),
                lot.getFarmer() == null ? null : lot.getFarmer().getId(),
                lot.getOrganization() == null ? null : lot.getOrganization().getId(),
                lot.getQuantity(),
                lot.getQuantityUnit(),
                lot.getHarvestDate(),
                lot.getAvailableFrom(),
                lot.getStatus());
    }
}