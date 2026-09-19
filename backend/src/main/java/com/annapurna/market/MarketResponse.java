package com.annapurna.market;

import java.util.UUID;

public record MarketResponse(
        UUID id,
        String name,
        String marketCode,
        String marketTypeCode,
        String state,
        String district,
        boolean active) {
    public static MarketResponse from(Market market) {
        return new MarketResponse(
                market.getId(),
                market.getName(),
                market.getMarketCode(),
                market.getMarketTypeCode(),
                market.getState(),
                market.getDistrict(),
                market.isActive());
    }
}