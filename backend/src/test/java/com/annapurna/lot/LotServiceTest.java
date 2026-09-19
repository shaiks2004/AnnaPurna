package com.annapurna.lot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AccessControlService;
import com.annapurna.commodity.Commodity;
import com.annapurna.commodity.CommodityRepository;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.farmer.FarmerProfile;
import com.annapurna.farmer.FarmerProfileRepository;
import com.annapurna.fpo.FpoProfileRepository;
import com.annapurna.organization.OrganizationRepository;
import com.annapurna.supply.Supply;
import com.annapurna.supply.SupplyRepository;
import com.annapurna.user.PlatformUser;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

class LotServiceTest {
    private final LotRepository lotRepository = mock(LotRepository.class);
    private final SupplyRepository supplyRepository = mock(SupplyRepository.class);
    private final CommodityRepository commodityRepository = mock(CommodityRepository.class);
    private final FarmerProfileRepository farmerProfileRepository = mock(FarmerProfileRepository.class);
    private final OrganizationRepository organizationRepository = mock(OrganizationRepository.class);
    private final FpoProfileRepository fpoProfileRepository = mock(FpoProfileRepository.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);
    private LotService service;

    @BeforeEach
    void setUp() {
        service = new LotService(
                lotRepository, supplyRepository, commodityRepository, farmerProfileRepository,
                organizationRepository, fpoProfileRepository, accessControlService);
    }

    @Test
    void authorizedLotStartsInDeclaredState() {
        UUID farmerId = UUID.randomUUID();
        UUID commodityId = UUID.randomUUID();
        FarmerProfile farmer = mock(FarmerProfile.class);
        PlatformUser user = mock(PlatformUser.class);
        Commodity commodity = mock(Commodity.class);
        when(farmer.getId()).thenReturn(farmerId);
        when(farmer.getUser()).thenReturn(user);
        when(commodity.getId()).thenReturn(commodityId);
        when(commodityRepository.findById(commodityId)).thenReturn(Optional.of(commodity));
        when(farmerProfileRepository.findById(farmerId)).thenReturn(Optional.of(farmer));
        when(lotRepository.save(any(Lot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LotResponse response = service.create(new LotCreateRequest(
                "LOT-ANN-001", commodityId, null, farmerId, null,
                new BigDecimal("3.200"), "MT", null, null));

        assertThat(response.status()).isEqualTo(LotStatus.DECLARED);
        verify(accessControlService).requireFarmerAccess(user.getId());
    }

    @Test
    void mismatchedSourceSupplyIsRejected() {
        UUID farmerId = UUID.randomUUID();
        UUID commodityId = UUID.randomUUID();
        Commodity lotCommodity = mock(Commodity.class);
        Commodity sourceCommodity = mock(Commodity.class);
        FarmerProfile farmer = mock(FarmerProfile.class);
        PlatformUser farmerUser = mock(PlatformUser.class);
        Supply sourceSupply = mock(Supply.class);
        when(lotCommodity.getId()).thenReturn(commodityId);
        when(sourceCommodity.getId()).thenReturn(UUID.randomUUID());
        when(farmer.getUser()).thenReturn(farmerUser);
        when(farmerUser.getId()).thenReturn(UUID.randomUUID());
        when(sourceSupply.getCommodity()).thenReturn(sourceCommodity);
        when(commodityRepository.findById(commodityId)).thenReturn(Optional.of(lotCommodity));
        when(farmerProfileRepository.findById(farmerId)).thenReturn(Optional.of(farmer));
        when(supplyRepository.findById(any())).thenReturn(Optional.of(sourceSupply));

        assertThatThrownBy(() -> service.create(new LotCreateRequest(
                "LOT-ANN-002", commodityId, UUID.randomUUID(), farmerId, null,
                new BigDecimal("1.000"), "MT", null, null)))
                .isInstanceOf(InvalidRequestException.class);
        verify(lotRepository, never()).save(any(Lot.class));
    }

    @Test
    void nonOwnerCannotModifyLot() {
        Lot lot = mock(Lot.class);
        FarmerProfile farmer = mock(FarmerProfile.class);
        PlatformUser owner = mock(PlatformUser.class);
        when(lot.getFarmer()).thenReturn(farmer);
        when(farmer.getUser()).thenReturn(owner);
        when(lot.getStatus()).thenReturn(LotStatus.DECLARED);
        when(lotRepository.findById(any())).thenReturn(Optional.of(lot));
        doThrow(new AccessDeniedException("denied")).when(accessControlService).requireFarmerAccess(any());

        assertThatThrownBy(() -> service.update(
                UUID.randomUUID(), new LotPatchRequest(new BigDecimal("2"), null, null, null)))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void nonDeclaredLotCannotBePatched() {
        Lot lot = mock(Lot.class);
        FarmerProfile farmer = mock(FarmerProfile.class);
        PlatformUser owner = mock(PlatformUser.class);
        when(lot.getFarmer()).thenReturn(farmer);
        when(farmer.getUser()).thenReturn(owner);
        when(lot.getStatus()).thenReturn(LotStatus.AVAILABLE);
        when(lotRepository.findById(any())).thenReturn(Optional.of(lot));

        assertThatThrownBy(() -> service.update(
                UUID.randomUUID(), new LotPatchRequest(new BigDecimal("2"), null, null, null)))
                .isInstanceOf(InvalidRequestException.class);
    }
}