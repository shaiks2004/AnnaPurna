package com.annapurna.matching;

import com.annapurna.lot.LotStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MatchCandidate(
        UUID lotId,
        UUID commodityId,
        BigDecimal availableQuantity,
        String quantityUnit,
        LocalDate availableFrom,
        LotStatus status) {
}
