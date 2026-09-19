package com.annapurna.lot;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record LotLocationResponse(UUID lotId, String type, List<BigDecimal> coordinates) {
    public static LotLocationResponse from(LotLocation location) {
        return new LotLocationResponse(
                location.getLot().getId(),
                "Point",
                List.of(
                        BigDecimal.valueOf(location.getLocation().getX()),
                        BigDecimal.valueOf(location.getLocation().getY())));
    }
}