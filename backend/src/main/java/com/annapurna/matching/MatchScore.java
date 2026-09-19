package com.annapurna.matching;

import java.math.BigDecimal;
import java.util.Map;

public record MatchScore(
        BigDecimal value,
        String modelName,
        String modelVersion,
        Map<String, BigDecimal> components) {
}
