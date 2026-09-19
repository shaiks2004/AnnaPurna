package com.annapurna.commodity;

import java.util.UUID;

public record CommodityResponse(UUID id, String name, String commodityCode, boolean active) {
    public static CommodityResponse from(Commodity commodity) {
        return new CommodityResponse(commodity.getId(), commodity.getName(), commodity.getCommodityCode(), commodity.isActive());
    }
}