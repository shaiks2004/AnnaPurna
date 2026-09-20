package com.annapurna.matching;

import com.annapurna.requirement.Requirement;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class MatchRanker {
    private final MatchFeatureBuilder featureBuilder;
    private final MatchModel matchModel;

    public MatchRanker(MatchFeatureBuilder featureBuilder, MatchModel matchModel) {
        this.featureBuilder = featureBuilder;
        this.matchModel = matchModel;
    }

    public List<MatchResult> rank(Requirement requirement, List<MatchCandidate> candidates) {
        List<EvaluatedMatch> evaluated = new ArrayList<>();
        for (MatchCandidate candidate : candidates) {
            MatchFeatures features = featureBuilder.build(requirement, candidate);
            evaluated.add(new EvaluatedMatch(candidate, features, matchModel.score(features)));
        }
        evaluated.sort(Comparator
                .comparing((EvaluatedMatch match) -> match.score().value()).reversed()
                .thenComparing((EvaluatedMatch match) -> match.features().qualityVerified(), Comparator.reverseOrder())
                .thenComparing((EvaluatedMatch match) -> match.features().quantityCoverageRatio(), Comparator.reverseOrder())
                .thenComparing(match -> match.candidate().lotId()));

        List<MatchResult> results = new ArrayList<>();
        for (int index = 0; index < evaluated.size(); index++) {
            EvaluatedMatch match = evaluated.get(index);
            results.add(MatchResult.from(
                    requirement.getId(),
                    match.candidate().lotId(),
                    match.score(),
                    index + 1,
                    explain(match.features())));
        }
        return results;
    }

    private MatchExplanation explain(MatchFeatures features) {
        List<String> reasons = new ArrayList<>();
        reasons.add(features.commodityCompatible() ? "Commodity matches exactly" : "Commodity does not match");
        reasons.add("Lot quantity covers " + features.quantityCoverageRatio().stripTrailingZeros().toPlainString() + " of the requirement");
        if (features.qualityVerified()) {
            reasons.add("Quality verification available");
        } else if (features.qualityEvidenceAvailable()) {
            reasons.add("Quality evidence exists but is not verified");
        } else {
            reasons.add("Quality verification unavailable");
        }
        reasons.add(features.geographyAvailable() ? "Geographic fit available" : "Geographic distance unavailable");
        reasons.add(features.deliveryDateAvailable()
                ? (features.deliveryCompatible() ? "Availability is before the required-by date" : "Availability is after the required-by date")
                : "Availability date unavailable");
        return new MatchExplanation(reasons);
    }

    private record EvaluatedMatch(MatchCandidate candidate, MatchFeatures features, MatchScore score) {
    }
}
