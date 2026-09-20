package com.annapurna.market;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MarketCreateRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 64) String marketCode,
        @Size(max = 64) String marketTypeCode,
        @Size(max = 128) String state,
        @Size(max = 128) String district,
        boolean active) {}