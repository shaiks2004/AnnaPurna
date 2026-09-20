package com.annapurna.market;

import jakarta.validation.constraints.Size;

public record MarketPatchRequest(
        @Size(max = 255) String name,
        @Size(max = 64) String marketCode,
        @Size(max = 64) String marketTypeCode,
        @Size(max = 128) String state,
        @Size(max = 128) String district,
        Boolean active) {
    public boolean hasChanges() {
        return name != null
                || marketCode != null
                || marketTypeCode != null
                || state != null
                || district != null
                || active != null;
    }
}