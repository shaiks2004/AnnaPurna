package com.annapurna.lot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record GeoPointRequest(
        @NotBlank String type,
        @NotNull @Size(min = 2, max = 2) List<BigDecimal> coordinates) {}