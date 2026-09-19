package com.annapurna.matching;

public interface MatchModel {
    MatchScore score(MatchFeatures features);
}
