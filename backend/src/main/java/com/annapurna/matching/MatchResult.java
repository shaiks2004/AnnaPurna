package com.annapurna.matching;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record MatchResult(
        UUID requirementId,
        UUID lotId,
        BigDecimal score,
        String modelName,
        String modelVersion,
        int rankedPosition,
        List<String> explanation) {
    public static MatchResult from(UUID requirementId, UUID lotId, MatchScore score, int position, MatchExplanation explanation) {
        return new MatchResult(requirementId, lotId, score.value(), score.modelName(), score.modelVersion(), position, explanation.reasons());
    }
}
