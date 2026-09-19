package com.annapurna.commodity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommodityCreateRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 64) String commodityCode,
        boolean active) {}