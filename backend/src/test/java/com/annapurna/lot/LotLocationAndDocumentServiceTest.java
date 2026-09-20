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
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.farmer.FarmerProfile;
import com.annapurna.user.PlatformUser;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.security.access.AccessDeniedException;

class LotLocationAndDocumentServiceTest {
    private final LotRepository lotRepository = mock(LotRepository.class);
    private final LotLocationRepository locationRepository = mock(LotLocationRepository.class);
    private final LotDocumentRepository documentRepository = mock(LotDocumentRepository.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);

    @Test
    void locationPutPreservesWgs84PointCoordinates() {
        Lot lot = ownedDeclaredLot();
        when(lotRepository.findById(any())).thenReturn(Optional.of(lot));
        when(locationRepository.findByLotId(any())).thenReturn(Optional.empty());
        when(locationRepository.save(any(LotLocation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LotLocationResponse response = new LotLocationService(
                lotRepository, locationRepository, accessControlService).put(
                        lot.getId(), new GeoPointRequest(
                                "Point", List.of(new BigDecimal("73.789"), new BigDecimal("19.997"))));

        assertThat(response.type()).isEqualTo("Point");
        assertThat(response.coordinates()).containsExactly(
                new BigDecimal("73.789"), new BigDecimal("19.997"));
    }

    @Test
    void invalidLocationCoordinatesAreRejected() {
        Lot lot = ownedDeclaredLot();
        when(lotRepository.findById(any())).thenReturn(Optional.of(lot));

        assertThatThrownBy(() -> new LotLocationService(
                lotRepository, locationRepository, accessControlService).put(
                        lot.getId(), new GeoPointRequest("Point", List.of(BigDecimal.valueOf(181), BigDecimal.ZERO))))
                .isInstanceOf(InvalidRequestException.class);
        verify(locationRepository, never()).save(any(LotLocation.class));
    }

    @Test
    void documentServiceRejectsExternalUrlsAndHidesUnauthorizedLot() {
        Lot lot = ownedDeclaredLot();
        when(lotRepository.findById(any())).thenReturn(Optional.of(lot));
        doThrow(new AccessDeniedException("denied")).when(accessControlService).requireFarmerAccess(any());

        LotDocumentService service = new LotDocumentService(lotRepository, documentRepository, accessControlService);
        assertThatThrownBy(() -> service.create(lot.getId(), new LotDocumentCreateRequest(
                "QUALITY", "https://example.invalid/file", null, null, null)))
                .isInstanceOf(AccessDeniedException.class);

        org.mockito.Mockito.doNothing().when(accessControlService).requireFarmerAccess(any());
        assertThatThrownBy(() -> service.create(lot.getId(), new LotDocumentCreateRequest(
                "QUALITY", "https://example.invalid/file", null, null, null)))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void documentServiceCreatesOpaqueMetadata() {
        Lot lot = ownedDeclaredLot();
        when(lotRepository.findById(any())).thenReturn(Optional.of(lot));
        when(documentRepository.save(any(LotDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LotDocumentResponse response = new LotDocumentService(
                lotRepository, documentRepository, accessControlService).create(
                        lot.getId(), new LotDocumentCreateRequest(
                                "QUALITY", "object-key-1", "report.pdf", "application/pdf", "checksum"));

        assertThat(response.storageReference()).isEqualTo("object-key-1");
        verify(documentRepository).save(any(LotDocument.class));
    }

    private Lot ownedDeclaredLot() {
        Lot lot = mock(Lot.class);
        FarmerProfile farmer = mock(FarmerProfile.class);
        PlatformUser user = mock(PlatformUser.class);
        when(lot.getFarmer()).thenReturn(farmer);
        when(farmer.getUser()).thenReturn(user);
        when(user.getId()).thenReturn(UUID.randomUUID());
        when(lot.getStatus()).thenReturn(LotStatus.DECLARED);
        when(lot.getId()).thenReturn(UUID.randomUUID());
        return lot;
    }
}