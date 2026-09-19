package com.annapurna.commodity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AccessControlService;
import com.annapurna.common.web.ResourceNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

class CommodityServiceTest {
    private final CommodityRepository repository = mock(CommodityRepository.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);
    private CommodityService service;

    @BeforeEach
    void setUp() {
        service = new CommodityService(repository, accessControlService);
    }

    @Test
    void searchUsesRepositoryFilteringAndPagination() {
        Commodity commodity = mock(Commodity.class);
        when(repository.findByNameContainingIgnoreCase(eq("onion"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(commodity)));

        assertThat(service.list(" onion ", 1, 10).getTotalElements()).isEqualTo(1);
        verify(repository).findByNameContainingIgnoreCase(eq("onion"), any(Pageable.class));
    }

    @Test
    void createRequiresAdminAndPreservesValidatedFields() {
        Commodity saved = mock(Commodity.class);
        when(repository.save(any(Commodity.class))).thenReturn(saved);

        assertThat(service.create(new CommodityCreateRequest(" Onion ", " ONION ", true))).isEqualTo(
                CommodityResponse.from(saved));
        verify(accessControlService).requireAdmin();
        verify(repository).save(any(Commodity.class));
    }

    @Test
    void duplicateCommodityIsReturnedToTheConflictHandler() {
        doThrow(new DataIntegrityViolationException("duplicate")).when(repository).save(any(Commodity.class));

        assertThatThrownBy(() -> service.create(new CommodityCreateRequest("Onion", "ONION", true)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void missingCommodityReturnsNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(id)).isInstanceOf(ResourceNotFoundException.class);
    }
}