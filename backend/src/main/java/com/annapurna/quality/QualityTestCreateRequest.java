package com.annapurna.quality;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record QualityTestCreateRequest(
        @NotBlank @Size(max = 64) String testType,
        Instant sampledAt,
        Instant testedAt,
        @NotBlank @Size(max = 64) String methodCode,
        @Size(max = 64) String sourceCode,
        @Size(max = 2000) String notes) {
    public QualityTestCreateRequest {
        if (sampledAt == null) sampledAt = Instant.now();
    }
}
