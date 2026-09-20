package com.annapurna.commodity;

import jakarta.validation.constraints.Size;

public record CommodityPatchRequest(
        @Size(max = 255) String name,
        @Size(max = 64) String commodityCode,
        Boolean active) {
    public boolean hasChanges() {
        return name != null || commodityCode != null || active != null;
    }
}