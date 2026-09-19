package com.annapurna.matching;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.annapurna.commodity.Commodity;
import com.annapurna.lot.Lot;
import com.annapurna.lot.LotRepository;
import com.annapurna.lot.LotStatus;
import com.annapurna.requirement.Requirement;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JpaCandidateLotProviderTest {
    @Test
    void retrievesOnlyTheRequirementCommodityAndEligibleStatuses() {
        LotRepository lotRepository = mock(LotRepository.class);
        JpaCandidateLotProvider provider = new JpaCandidateLotProvider(lotRepository);
        UUID commodityId = UUID.randomUUID();
        Commodity commodity = mock(Commodity.class);
        when(commodity.getId()).thenReturn(commodityId);
        Requirement requirement = mock(Requirement.class);
        when(requirement.getCommodity()).thenReturn(commodity);

        Lot lot = mock(Lot.class);
        UUID lotId = UUID.randomUUID();
        when(lot.getId()).thenReturn(lotId);
        when(lot.getCommodity()).thenReturn(commodity);
        when(lot.getQuantity()).thenReturn(new BigDecimal("100"));
        when(lot.getQuantityUnit()).thenReturn("MT");
        when(lot.getAvailableFrom()).thenReturn(LocalDate.now());
        when(lot.getStatus()).thenReturn(LotStatus.AVAILABLE);
        when(lotRepository.findByCommodityIdAndStatusIn(commodityId, List.of(LotStatus.AVAILABLE)))
                .thenReturn(List.of(lot));

        assertThat(provider.findCandidates(requirement)).extracting(MatchCandidate::lotId).containsExactly(lotId);
    }
}
