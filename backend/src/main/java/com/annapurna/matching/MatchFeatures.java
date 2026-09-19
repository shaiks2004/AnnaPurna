package com.annapurna.matching;

import com.annapurna.lot.LotStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MatchFeatures(
        UUID requirementId,
        UUID lotId,
        UUID requirementCommodityId,
        UUID lotCommodityId,
        boolean commodityCompatible,
        BigDecimal requirementQuantity,
        BigDecimal availableQuantity,
        BigDecimal quantityCoverageRatio,
        String requirementQuantityUnit,
        String lotQuantityUnit,
        LotStatus lotStatus,
        boolean qualityEvidenceAvailable,
        boolean qualityVerified,
        boolean geographyAvailable,
        BigDecimal geographyFit,
        LocalDate requiredBy,
        LocalDate availableFrom,
        boolean deliveryDateAvailable,
        boolean deliveryCompatible,
        boolean priceAvailable) {
}
