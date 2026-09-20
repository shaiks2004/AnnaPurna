package com.annapurna.matching;

import static org.assertj.core.api.Assertions.assertThat;

import com.annapurna.lot.LotStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DeterministicBaselineMatchModelTest {
    private final DeterministicBaselineMatchModel model =
            new DeterministicBaselineMatchModel(new BaselineMatchWeights());

    @Test
    void scoreIsDeterministicAndBoundedWhenDataIsMissing() {
        MatchFeatures features = new MatchFeatures(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                true, new BigDecimal("100"), new BigDecimal("50"), new BigDecimal("0.5"),
                "MT", "MT", LotStatus.AVAILABLE, false, false, false, BigDecimal.ZERO,
                LocalDate.now().plusDays(10), null, false, false, false);

        MatchScore first = model.score(features);
        MatchScore second = model.score(features);

        assertThat(first).isEqualTo(second);
        assertThat(first.value()).isBetween(BigDecimal.ZERO, BigDecimal.ONE);
        assertThat(first.modelName()).isEqualTo("deterministic-baseline");
        assertThat(first.modelVersion()).isEqualTo("v1");
        assertThat(first.components().get("quality")).isZero();
        assertThat(first.components().get("geography")).isZero();
    }

    @Test
    void verifiedQualityImprovesScore() {
        MatchFeatures withoutQuality = features(false, false);
        MatchFeatures verifiedQuality = features(true, true);

        assertThat(model.score(verifiedQuality).value()).isGreaterThan(model.score(withoutQuality).value());
    }

    private MatchFeatures features(boolean evidence, boolean verified) {
        return new MatchFeatures(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                true, new BigDecimal("100"), new BigDecimal("100"), BigDecimal.ONE,
                "MT", "MT", LotStatus.AVAILABLE, evidence, verified, false, BigDecimal.ZERO,
                LocalDate.now().plusDays(10), LocalDate.now(), true, true, false);
    }
}
