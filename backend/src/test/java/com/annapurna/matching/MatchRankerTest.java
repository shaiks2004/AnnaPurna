package com.annapurna.matching;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.annapurna.commodity.Commodity;
import com.annapurna.quality.QualityTestRepository;
import com.annapurna.requirement.Requirement;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MatchRankerTest {
    @Test
    void ranksByScoreThenLotIdDeterministically() {
        QualityTestRepository repository = mock(QualityTestRepository.class);
        MatchFeatureBuilder builder = new MatchFeatureBuilder(repository);
        MatchRanker ranker = new MatchRanker(builder, new DeterministicBaselineMatchModel(new BaselineMatchWeights()));
        UUID commodityId = UUID.randomUUID();
        Commodity commodity = mock(Commodity.class);
        when(commodity.getId()).thenReturn(commodityId);
        Requirement requirement = mock(Requirement.class);
        when(requirement.getId()).thenReturn(UUID.randomUUID());
        when(requirement.getCommodity()).thenReturn(commodity);
        when(requirement.getQuantity()).thenReturn(new BigDecimal("100"));
        when(requirement.getQuantityUnit()).thenReturn("MT");
        when(requirement.getRequiredBy()).thenReturn(LocalDate.now().plusDays(10));

        UUID lowerLotId = UUID.randomUUID();
        UUID higherLotId = UUID.randomUUID();
        UUID first = lowerLotId.compareTo(higherLotId) < 0 ? lowerLotId : higherLotId;
        UUID second = first.equals(lowerLotId) ? higherLotId : lowerLotId;
        when(repository.findByLotIdOrderByTestedAtDesc(lowerLotId)).thenReturn(List.of());
        when(repository.findByLotIdOrderByTestedAtDesc(higherLotId)).thenReturn(List.of());

        List<MatchResult> results = ranker.rank(requirement, List.of(
                new MatchCandidate(second, commodityId, new BigDecimal("100"), "MT", LocalDate.now(), com.annapurna.lot.LotStatus.AVAILABLE),
                new MatchCandidate(first, commodityId, new BigDecimal("100"), "MT", LocalDate.now(), com.annapurna.lot.LotStatus.AVAILABLE)));

        assertThat(results).extracting(MatchResult::lotId).containsExactly(first, second);
        assertThat(results).extracting(MatchResult::rankedPosition).containsExactly(1, 2);
    }
}
