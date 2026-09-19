package com.annapurna.matching;

import com.annapurna.requirement.Requirement;
import java.util.List;

public interface CandidateLotProvider {
    List<MatchCandidate> findCandidates(Requirement requirement);
}
