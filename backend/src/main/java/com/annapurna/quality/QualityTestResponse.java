package com.annapurna.quality;

import java.time.Instant;
import java.util.UUID;

public record QualityTestResponse(
        UUID id,
        UUID lotId,
        UUID inspectorUserId,
        String testType,
        Instant sampledAt,
        Instant testedAt,
        QualityTestStatus status,
        String methodCode,
        String sourceCode,
        String notes,
        Instant verifiedAt,
        UUID verifiedByUserId) {
    public static QualityTestResponse from(QualityTest test) {
        if (test == null || test.getLot() == null) {
            throw new IllegalArgumentException("Quality test must belong to a lot");
        }
        return new QualityTestResponse(
                test.getId(),
                test.getLot().getId(),
                test.getInspectorUser() == null ? null : test.getInspectorUser().getId(),
                test.getTestType(),
                test.getSampledAt(),
                test.getTestedAt(),
                test.getStatus(),
                test.getMethodCode(),
                test.getSourceCode(),
                test.getNotes(),
                test.getVerifiedAt(),
                test.getVerifiedByUser() == null ? null : test.getVerifiedByUser().getId());
    }
}
