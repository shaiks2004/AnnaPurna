package com.annapurna.matching;

import java.util.List;

public record MatchExplanation(List<String> reasons) {
    public MatchExplanation {
        reasons = List.copyOf(reasons);
    }
}
