package com.annapurna.marketprice;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AccessControlService;
import com.annapurna.commodity.Commodity;
import com.annapurna.commodity.CommodityRepository;
import com.annapurna.market.Market;
import com.annapurna.market.MarketRepository;
import com.annapurna.common.web.InvalidRequestException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

class MarketPriceServiceTest {
    private final MarketPriceRepository repository = mock(MarketPriceRepository.class);
    private final CommodityRepository commodityRepository = mock(CommodityRepository.class);
    private final MarketRepository marketRepository = mock(MarketRepository.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);
    private MarketPriceService service;

    @BeforeEach
    void setUp() {
        service = new MarketPriceService(repository, commodityRepository, marketRepository, accessControlService);
    }

    @Test
    void listPassesFiltersAndUsesPagedRepositoryQuery() {
        UUID commodityId = UUID.randomUUID();
        UUID marketId = UUID.randomUUID();
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);
        MarketPrice price = mock(MarketPrice.class);
        when(price.getCommodity()).thenReturn(mock(com.annapurna.commodity.Commodity.class));
        when(price.getMarket()).thenReturn(mock(com.annapurna.market.Market.class));
        when(repository.search(eq(commodityId), eq(marketId), eq(from), eq(to), any(Pageable.class)))
            .thenReturn(new PageImpl<>(java.util.List.of(price)));

        service.list(commodityId, marketId, from, to, 0, 20);

        verify(repository).search(eq(commodityId), eq(marketId), eq(from), eq(to), any(Pageable.class));
    }

    @Test
    void invalidDateRangeIsRejectedBeforeQuery() {
        LocalDate from = LocalDate.of(2026, 2, 1);
        LocalDate to = LocalDate.of(2026, 1, 1);

        assertThatThrownBy(() -> service.list(null, null, from, to, 0, 20))
                .isInstanceOf(InvalidRequestException.class);
        verify(repository, never()).search(any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    void negativePriceIsRejectedBeforePersistence() {
        MarketPriceCreateRequest request = new MarketPriceCreateRequest(
                UUID.randomUUID(), UUID.randomUUID(), LocalDate.of(2026, 1, 1), null, null,
                new BigDecimal("-1"), null, null, null, "INR/KG", null, null, "controlled-test-source", "ref-1");

        assertThatThrownBy(() -> service.create(request)).isInstanceOf(InvalidRequestException.class);
        verify(repository, never()).save(any(MarketPrice.class));
    }

    @Test
    void createRequiresAdminAndResolvesBothTraceabilityReferences() {
        UUID commodityId = UUID.randomUUID();
        UUID marketId = UUID.randomUUID();
        Commodity commodity = mock(Commodity.class);
        Market market = mock(Market.class);
        when(commodityRepository.findById(commodityId)).thenReturn(java.util.Optional.of(commodity));
        when(marketRepository.findById(marketId)).thenReturn(java.util.Optional.of(market));
        when(repository.save(any(MarketPrice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        MarketPriceCreateRequest request = new MarketPriceCreateRequest(
                commodityId, marketId, LocalDate.of(2026, 1, 1), null, null,
                new BigDecimal("10.0000"), new BigDecimal("12.0000"), new BigDecimal("11.0000"),
                "INR", "KG", new BigDecimal("100.000"), "KG", "controlled-test-source", "ref-1");

        service.create(request);

        verify(accessControlService).requireAdmin();
        verify(repository).save(any(MarketPrice.class));
    }
}