package com.annapurna.quality;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record QualityMeasurementCreateRequest(
        @NotBlank @Size(max = 128) String metricName,
        @NotBlank @Size(max = 32) String unit,
        @NotNull BigDecimal numericValue,
        @Size(max = 512) String textValue) {
}
