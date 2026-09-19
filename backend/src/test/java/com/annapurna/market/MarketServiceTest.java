package com.annapurna.market;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AccessControlService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

class MarketServiceTest {
    private final MarketRepository repository = mock(MarketRepository.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);
    private MarketService service;

    @BeforeEach
    void setUp() {
        service = new MarketService(repository, accessControlService);
    }

    @Test
    void listCombinesSearchAdministrativeAndCommodityFilters() {
        UUID commodityId = UUID.randomUUID();
        when(repository.search(eq("nashik"), eq("Maharashtra"), eq("Nashik"), eq(commodityId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(mock(Market.class))));

        assertThat(service.list(" nashik ", " Maharashtra ", " Nashik ", commodityId, 0, 20))
                .hasSize(1);
        verify(repository).search(eq("nashik"), eq("Maharashtra"), eq("Nashik"), eq(commodityId), any(Pageable.class));
    }

    @Test
    void createRequiresAdmin() {
        Market saved = mock(Market.class);
        when(repository.save(any(Market.class))).thenReturn(saved);

        service.create(new MarketCreateRequest("Nashik", "NASHIK", null, "Maharashtra", "Nashik", true));

        verify(accessControlService).requireAdmin();
        verify(repository).save(any(Market.class));
    }
}