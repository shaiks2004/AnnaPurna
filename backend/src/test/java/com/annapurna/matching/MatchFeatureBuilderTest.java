package com.annapurna.matching;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.annapurna.commodity.Commodity;
import com.annapurna.quality.QualityTest;
import com.annapurna.quality.QualityTestRepository;
import com.annapurna.quality.QualityTestStatus;
import com.annapurna.requirement.Requirement;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MatchFeatureBuilderTest {
    private final QualityTestRepository qualityTestRepository = mock(QualityTestRepository.class);
    private final MatchFeatureBuilder builder = new MatchFeatureBuilder(qualityTestRepository);

    @Test
    void buildsQuantityCoverageAndVerifiedQualityFeatures() {
        UUID commodityId = UUID.randomUUID();
        UUID lotId = UUID.randomUUID();
        Commodity commodity = mock(Commodity.class);
        when(commodity.getId()).thenReturn(commodityId);
        Requirement requirement = mock(Requirement.class);
        when(requirement.getId()).thenReturn(UUID.randomUUID());
        when(requirement.getCommodity()).thenReturn(commodity);
        when(requirement.getQuantity()).thenReturn(new BigDecimal("100"));
        when(requirement.getQuantityUnit()).thenReturn("MT");
        when(requirement.getRequiredBy()).thenReturn(LocalDate.now().plusDays(10));
        QualityTest test = mock(QualityTest.class);
        when(test.getStatus()).thenReturn(QualityTestStatus.VERIFIED);
        when(qualityTestRepository.findByLotIdOrderByTestedAtDesc(lotId)).thenReturn(List.of(test));

        MatchFeatures features = builder.build(requirement, new MatchCandidate(
                lotId, commodityId, new BigDecimal("80"), "MT", LocalDate.now(),
                com.annapurna.lot.LotStatus.AVAILABLE));

        assertThat(features.quantityCoverageRatio()).isEqualByComparingTo("0.8");
        assertThat(features.qualityEvidenceAvailable()).isTrue();
        assertThat(features.qualityVerified()).isTrue();
        assertThat(features.geographyAvailable()).isFalse();
        assertThat(features.priceAvailable()).isFalse();
    }

    @Test
    void doesNotConvertIncompatibleUnits() {
        UUID commodityId = UUID.randomUUID();
        Commodity commodity = mock(Commodity.class);
        when(commodity.getId()).thenReturn(commodityId);
        Requirement requirement = mock(Requirement.class);
        when(requirement.getId()).thenReturn(UUID.randomUUID());
        when(requirement.getCommodity()).thenReturn(commodity);
        when(requirement.getQuantity()).thenReturn(new BigDecimal("100"));
        when(requirement.getQuantityUnit()).thenReturn("MT");
        when(requirement.getRequiredBy()).thenReturn(LocalDate.now().plusDays(10));
        UUID lotId = UUID.randomUUID();
        when(qualityTestRepository.findByLotIdOrderByTestedAtDesc(lotId)).thenReturn(List.of());

        MatchFeatures features = builder.build(requirement, new MatchCandidate(
                lotId, commodityId, new BigDecimal("100000"), "KG", LocalDate.now(),
                com.annapurna.lot.LotStatus.AVAILABLE));

        assertThat(features.quantityCoverageRatio()).isZero();
    }
}
