package com.annapurna.matching;

import java.util.UUID;

public record MatchRequest(UUID requirementId, int requestedLimit) {
}
