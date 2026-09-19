package com.annapurna.matching;

import com.annapurna.quality.QualityTestRepository;
import com.annapurna.quality.QualityTestStatus;
import com.annapurna.requirement.Requirement;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Component;

@Component
public class MatchFeatureBuilder {
    private final QualityTestRepository qualityTestRepository;

    public MatchFeatureBuilder(QualityTestRepository qualityTestRepository) {
        this.qualityTestRepository = qualityTestRepository;
    }

    public MatchFeatures build(Requirement requirement, MatchCandidate candidate) {
        boolean commodityCompatible = requirement.getCommodity().getId().equals(candidate.commodityId());
        boolean unitsCompatible = requirement.getQuantityUnit().equalsIgnoreCase(candidate.quantityUnit());
        BigDecimal quantityCoverage = BigDecimal.ZERO;
        if (unitsCompatible && requirement.getQuantity().signum() > 0) {
            quantityCoverage = candidate.availableQuantity()
                    .divide(requirement.getQuantity(), 8, RoundingMode.HALF_UP)
                    .min(BigDecimal.ONE)
                    .max(BigDecimal.ZERO);
        }

        var tests = qualityTestRepository.findByLotIdOrderByTestedAtDesc(candidate.lotId());
        boolean qualityEvidenceAvailable = !tests.isEmpty();
        boolean qualityVerified = tests.stream().anyMatch(test -> test.getStatus() == QualityTestStatus.VERIFIED);
        boolean deliveryDateAvailable = candidate.availableFrom() != null;
        boolean deliveryCompatible = deliveryDateAvailable
                && !candidate.availableFrom().isAfter(requirement.getRequiredBy());

        return new MatchFeatures(
                requirement.getId(),
                candidate.lotId(),
                requirement.getCommodity().getId(),
                candidate.commodityId(),
                commodityCompatible,
                requirement.getQuantity(),
                candidate.availableQuantity(),
                quantityCoverage,
                requirement.getQuantityUnit(),
                candidate.quantityUnit(),
                candidate.status(),
                qualityEvidenceAvailable,
                qualityVerified,
                false,
                BigDecimal.ZERO,
                requirement.getRequiredBy(),
                candidate.availableFrom(),
                deliveryDateAvailable,
                deliveryCompatible,
                false);
    }
}
