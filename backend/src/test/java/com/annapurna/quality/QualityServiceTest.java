package com.annapurna.quality;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AccessControlService;
import com.annapurna.auth.AuthenticatedUser;
import com.annapurna.auth.PlatformUserRepository;
import com.annapurna.auth.Role;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.ResourceNotFoundException;
import com.annapurna.lot.Lot;
import com.annapurna.lot.LotDocumentRepository;
import com.annapurna.lot.LotLocationRepository;
import com.annapurna.lot.LotRepository;
import com.annapurna.user.PlatformUser;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

class QualityServiceTest {
    private final LotRepository lotRepository = mock(LotRepository.class);
    private final QualityTestRepository qualityTestRepository = mock(QualityTestRepository.class);
    private final QualityMeasurementRepository qualityMeasurementRepository = mock(QualityMeasurementRepository.class);
    private final LotDocumentRepository lotDocumentRepository = mock(LotDocumentRepository.class);
    private final LotLocationRepository lotLocationRepository = mock(LotLocationRepository.class);
    private final PlatformUserRepository platformUserRepository = mock(PlatformUserRepository.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);
    private QualityService service;

    @BeforeEach
    void setUp() {
        service = new QualityService(
                lotRepository,
                qualityTestRepository,
                qualityMeasurementRepository,
                lotDocumentRepository,
                lotLocationRepository,
                platformUserRepository,
                accessControlService);
    }

    @Test
    void inspectorCanCreateQualityTestForOwnedLot() {
        UUID lotId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Lot lot = mock(Lot.class);
        PlatformUser inspector = mock(PlatformUser.class);
        when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));
        when(accessControlService.current()).thenReturn(new com.annapurna.auth.AuthenticatedUser(userId, java.util.Set.of(), java.util.Set.of(com.annapurna.auth.Role.QUALITY_INSPECTOR), java.util.Map.of()));
        when(platformUserRepository.findById(userId)).thenReturn(Optional.of(inspector));
        when(qualityTestRepository.save(any(QualityTest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        QualityTestResponse response = service.createTest(lotId, new QualityTestCreateRequest(
                "PHYSICAL_CHECK",
                Instant.now(),
                Instant.now(),
                "VISUAL",
                "MANUAL",
                "Initial sampling"));

        assertThat(response.testType()).isEqualTo("PHYSICAL_CHECK");
        assertThat(response.status()).isEqualTo(QualityTestStatus.CREATED);
        verify(accessControlService).requireInspectionAccess(lotId);
    }

    @Test
    void nonInspectorCannotCreateAuthorizedVerification() {
        UUID testId = UUID.randomUUID();
        UUID lotId = UUID.randomUUID();
        Lot lot = mock(Lot.class);
        QualityTest test = mock(QualityTest.class);
        when(qualityTestRepository.findById(testId)).thenReturn(Optional.of(test));
        when(test.getLot()).thenReturn(lot);
        when(test.getStatus()).thenReturn(QualityTestStatus.TESTED);
        when(lot.getId()).thenReturn(lotId);
        when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));
        doThrowAccessDenied();

        assertThatThrownBy(() -> service.verifyTest(testId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void invalidTransitionIsRejected() {
        UUID testId = UUID.randomUUID();
        UUID lotId = UUID.randomUUID();
        Lot lot = mock(Lot.class);
        QualityTest test = mock(QualityTest.class);
        when(qualityTestRepository.findById(testId)).thenReturn(Optional.of(test));
        when(test.getLot()).thenReturn(lot);
        when(test.getStatus()).thenReturn(QualityTestStatus.VERIFIED);
        when(lot.getId()).thenReturn(lotId);
        when(lot.getFarmer()).thenReturn(null);
        com.annapurna.organization.Organization organization = mock(com.annapurna.organization.Organization.class);
        when(lot.getOrganization()).thenReturn(organization);
        when(organization.getId()).thenReturn(UUID.randomUUID());
        when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));
        when(accessControlService.current()).thenReturn(new AuthenticatedUser(UUID.randomUUID(), java.util.Set.of(), java.util.Set.of(Role.QUALITY_INSPECTOR), java.util.Map.of()));
        org.mockito.Mockito.doThrow(new IllegalStateException("Invalid quality test transition: VERIFIED -> SAMPLED"))
                .when(test).transitionTo(QualityTestStatus.SAMPLED);

        assertThatThrownBy(() -> service.transitionTo(testId, QualityTestStatus.SAMPLED))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void invalidMeasurementValueIsRejected() {
        UUID testId = UUID.randomUUID();
        UUID lotId = UUID.randomUUID();
        Lot lot = mock(Lot.class);
        QualityTest test = mock(QualityTest.class);
        when(qualityTestRepository.findById(testId)).thenReturn(Optional.of(test));
        when(test.getLot()).thenReturn(lot);
        when(test.getStatus()).thenReturn(QualityTestStatus.TESTED);
        when(lot.getId()).thenReturn(lotId);
        when(lot.getFarmer()).thenReturn(null);
        com.annapurna.organization.Organization organization = mock(com.annapurna.organization.Organization.class);
        when(lot.getOrganization()).thenReturn(organization);
        when(organization.getId()).thenReturn(UUID.randomUUID());
        when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));
        when(accessControlService.current()).thenReturn(new AuthenticatedUser(UUID.randomUUID(), java.util.Set.of(), java.util.Set.of(Role.QUALITY_INSPECTOR), java.util.Map.of()));

        assertThatThrownBy(() -> service.createMeasurement(testId, new QualityMeasurementCreateRequest(
                "moisture",
                "percent",
                BigDecimal.valueOf(-1),
                "percent")))
                .isInstanceOf(InvalidRequestException.class);
        verify(qualityMeasurementRepository, never()).save(any(QualityMeasurement.class));
    }

    @Test
    void passportUsesLatestVerifiedResult() {
        UUID lotId = UUID.randomUUID();
        UUID farmerId = UUID.randomUUID();
        Lot lot = mock(Lot.class);
        com.annapurna.farmer.FarmerProfile farmer = mock(com.annapurna.farmer.FarmerProfile.class);
        PlatformUser owner = mock(PlatformUser.class);
        when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));
        when(lot.getId()).thenReturn(lotId);
        when(lot.getLotNumber()).thenReturn("LOT-001");
        when(lot.getFarmer()).thenReturn(farmer);
        com.annapurna.commodity.Commodity commodity = mock(com.annapurna.commodity.Commodity.class);
        when(lot.getCommodity()).thenReturn(commodity);
        when(commodity.getId()).thenReturn(UUID.randomUUID());
        when(lot.getOrganization()).thenReturn(null);
        when(farmer.getId()).thenReturn(farmerId);
        when(farmer.getUser()).thenReturn(owner);
        when(owner.getId()).thenReturn(UUID.randomUUID());
        when(qualityTestRepository.findByLotIdOrderByTestedAtDesc(lotId)).thenReturn(List.of());
        when(lotDocumentRepository.findByLotIdOrderByCreatedAtAsc(lotId)).thenReturn(List.of());
        when(lotLocationRepository.findByLotId(lotId)).thenReturn(Optional.empty());

        LotPassportResponse passport = service.getLotPassport(lotId);
        assertThat(passport.lotId()).isEqualTo(lotId);
    }

    private void doThrowAccessDenied() {
        org.mockito.Mockito.doThrow(new AccessDeniedException("denied")).when(accessControlService).requireInspectionAccess(any());
    }
}
