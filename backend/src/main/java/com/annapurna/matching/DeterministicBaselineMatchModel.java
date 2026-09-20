package com.annapurna.matching;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import org.springframework.stereotype.Component;

@Component
public class DeterministicBaselineMatchModel implements MatchModel {
    public static final String MODEL_NAME = "deterministic-baseline";
    public static final String MODEL_VERSION = "v1";

    private final BaselineMatchWeights weights;

    public DeterministicBaselineMatchModel(BaselineMatchWeights weights) {
        this.weights = weights;
    }

    @Override
    public MatchScore score(MatchFeatures features) {
        var components = new LinkedHashMap<String, BigDecimal>();
        components.put("commodity", features.commodityCompatible() ? BigDecimal.ONE : BigDecimal.ZERO);
        components.put("quantity", features.quantityCoverageRatio());
        components.put("quality", qualityComponent(features));
        components.put("geography", features.geographyAvailable() ? features.geographyFit() : BigDecimal.ZERO);
        components.put("delivery", features.deliveryDateAvailable()
                ? (features.deliveryCompatible() ? BigDecimal.ONE : BigDecimal.ZERO)
                : BigDecimal.ZERO);

        BigDecimal totalWeight = weights.getCommodity()
                .add(weights.getQuantity())
                .add(weights.getQuality())
                .add(weights.getGeography())
                .add(weights.getDelivery());
        if (totalWeight.signum() <= 0) {
            throw new IllegalStateException("Baseline matching weights must have a positive total");
        }
        BigDecimal score = components.get("commodity").multiply(weights.getCommodity())
                .add(components.get("quantity").multiply(weights.getQuantity()))
                .add(components.get("quality").multiply(weights.getQuality()))
                .add(components.get("geography").multiply(weights.getGeography()))
                .add(components.get("delivery").multiply(weights.getDelivery()))
                .divide(totalWeight, 6, RoundingMode.HALF_UP)
                .max(BigDecimal.ZERO)
                .min(BigDecimal.ONE);
        return new MatchScore(score, MODEL_NAME, MODEL_VERSION, components);
    }

    private BigDecimal qualityComponent(MatchFeatures features) {
        if (features.qualityVerified()) {
            return BigDecimal.ONE;
        }
        return features.qualityEvidenceAvailable() ? new BigDecimal("0.5") : BigDecimal.ZERO;
    }
}
