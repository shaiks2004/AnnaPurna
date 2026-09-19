package com.annapurna.supply;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AccessControlService;
import com.annapurna.auth.AuthenticatedUser;
import com.annapurna.auth.Role;
import com.annapurna.commodity.Commodity;
import com.annapurna.commodity.CommodityRepository;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.ResourceNotFoundException;
import com.annapurna.farmer.FarmerProfile;
import com.annapurna.farmer.FarmerProfileRepository;
import com.annapurna.fpo.FpoProfileRepository;
import com.annapurna.organization.OrganizationRepository;
import com.annapurna.user.PlatformUser;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

class SupplyServiceTest {
    private final SupplyRepository supplyRepository = mock(SupplyRepository.class);
    private final CommodityRepository commodityRepository = mock(CommodityRepository.class);
    private final FarmerProfileRepository farmerProfileRepository = mock(FarmerProfileRepository.class);
    private final OrganizationRepository organizationRepository = mock(OrganizationRepository.class);
    private final FpoProfileRepository fpoProfileRepository = mock(FpoProfileRepository.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);
    private SupplyService service;

    @BeforeEach
    void setUp() {
        service = new SupplyService(
                supplyRepository,
                commodityRepository,
                farmerProfileRepository,
                organizationRepository,
                fpoProfileRepository,
                accessControlService);
    }

    @Test
    void farmerCanCreateOwnSupply() {
        UUID userId = UUID.randomUUID();
        UUID farmerId = UUID.randomUUID();
        UUID commodityId = UUID.randomUUID();
        PlatformUser user = mock(PlatformUser.class);
        FarmerProfile farmer = mock(FarmerProfile.class);
        Commodity commodity = mock(Commodity.class);
        when(user.getId()).thenReturn(userId);
        when(farmer.getId()).thenReturn(farmerId);
        when(farmer.getUser()).thenReturn(user);
        when(commodity.getId()).thenReturn(commodityId);
        when(commodityRepository.findById(commodityId)).thenReturn(Optional.of(commodity));
        when(farmerProfileRepository.findById(farmerId)).thenReturn(Optional.of(farmer));
        when(supplyRepository.save(any(Supply.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupplyResponse response = service.create(new SupplyCreateRequest(
                commodityId, farmerId, null, SupplyKind.EXPECTED_HARVEST,
                new BigDecimal("8.000"), "MT", null, null));

        assertThat(response.farmerId()).isEqualTo(farmerId);
        verify(accessControlService).requireFarmerAccess(userId);
    }

    @Test
    void farmerCannotCreateSupplyForAnotherFarmer() {
        UUID farmerId = UUID.randomUUID();
        UUID commodityId = UUID.randomUUID();
        FarmerProfile farmer = mock(FarmerProfile.class);
        PlatformUser farmerUser = mock(PlatformUser.class);
        when(farmerProfileRepository.findById(farmerId)).thenReturn(Optional.of(farmer));
        when(farmer.getUser()).thenReturn(farmerUser);
        when(farmerUser.getId()).thenReturn(UUID.randomUUID());
        when(commodityRepository.findById(commodityId)).thenReturn(Optional.of(mock(Commodity.class)));
        doThrow(new AccessDeniedException("denied")).when(accessControlService)
                .requireFarmerAccess(any());

        assertThatThrownBy(() -> service.create(new SupplyCreateRequest(
                commodityId, farmerId, null, SupplyKind.AVAILABLE_PHYSICAL,
                new BigDecimal("3.000"), "MT", null, null)))
                .isInstanceOf(AccessDeniedException.class);
        verify(supplyRepository, never()).save(any(Supply.class));
    }

    @Test
    void listUsesCallerVisibilityAndFilters() {
        UUID userId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        when(accessControlService.current()).thenReturn(
                new AuthenticatedUser(userId, Set.of(organizationId), Set.of(Role.FPO_USER), Map.of()));
        when(supplyRepository.search(
                eq(null), eq(null), eq(organizationId), eq(SupplyKind.AVAILABLE_PHYSICAL),
                any(), any(), any(), eq(false), eq(userId), eq(Set.of(organizationId)), any(Pageable.class)))
                .thenReturn(new PageImpl<>(java.util.List.of()));

        service.list(null, null, organizationId, SupplyKind.AVAILABLE_PHYSICAL,
                null, null, null, 0, 20);

        verify(supplyRepository).search(
                eq(null), eq(null), eq(organizationId), eq(SupplyKind.AVAILABLE_PHYSICAL),
                any(), any(), any(), eq(false), eq(userId), eq(Set.of(organizationId)), any(Pageable.class));
    }

    @Test
    void invalidQuantityIsRejectedByTheService() {
        assertThatThrownBy(() -> service.create(new SupplyCreateRequest(
                UUID.randomUUID(), UUID.randomUUID(), null, SupplyKind.EXPECTED_HARVEST,
                BigDecimal.ZERO, "MT", null, null)))
                .isInstanceOf(InvalidRequestException.class);
        verify(commodityRepository, never()).findById(any());
    }

    @Test
    void unauthorizedGetDoesNotRevealSupplyExistence() {
        Supply supply = mock(Supply.class);
        FarmerProfile farmer = mock(FarmerProfile.class);
        PlatformUser owner = mock(PlatformUser.class);
        when(supply.getFarmer()).thenReturn(farmer);
        when(farmer.getUser()).thenReturn(owner);
        when(owner.getId()).thenReturn(UUID.randomUUID());
        when(supplyRepository.findById(any())).thenReturn(Optional.of(supply));
        doThrow(new AccessDeniedException("denied")).when(accessControlService).requireFarmerAccess(any());

        assertThatThrownBy(() -> service.get(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}