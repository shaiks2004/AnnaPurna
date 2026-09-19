package com.annapurna.lot;

import com.annapurna.auth.AccessControlService;
import com.annapurna.auth.Role;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.ResourceNotFoundException;
import java.math.BigDecimal;
import java.util.UUID;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LotLocationService {
    private static final GeometryFactory WGS84_GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    private final LotRepository lotRepository;
    private final LotLocationRepository locationRepository;
    private final AccessControlService accessControlService;

    public LotLocationService(
            LotRepository lotRepository,
            LotLocationRepository locationRepository,
            AccessControlService accessControlService) {
        this.lotRepository = lotRepository;
        this.locationRepository = locationRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public LotLocationResponse get(UUID lotId) {
        Lot lot = findLot(lotId);
        requireReadAccess(lot);
        LotLocation location = locationRepository.findByLotId(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("Lot location"));
        return LotLocationResponse.from(location);
    }

    @Transactional
    public LotLocationResponse put(UUID lotId, GeoPointRequest request) {
        Lot lot = findLot(lotId);
        requireWriteAccess(lot);
        if (lot.getStatus() != LotStatus.DECLARED) {
            throw new InvalidRequestException("Only DECLARED lots can change location metadata");
        }
        Point point = toPoint(request);
        LotLocation location = locationRepository.findByLotId(lotId).orElse(null);
        if (location == null) {
            location = LotLocation.create(lot, point);
        } else {
            location.update(point);
        }
        return LotLocationResponse.from(locationRepository.save(location));
    }

    private Lot findLot(UUID lotId) {
        return lotRepository.findById(lotId).orElseThrow(() -> new ResourceNotFoundException("Lot"));
    }

    private Point toPoint(GeoPointRequest request) {
        if (!"Point".equalsIgnoreCase(request.type())) {
            throw new InvalidRequestException("Location type must be Point");
        }
        BigDecimal longitude = request.coordinates().get(0);
        BigDecimal latitude = request.coordinates().get(1);
        if (longitude.compareTo(BigDecimal.valueOf(-180)) < 0
                || longitude.compareTo(BigDecimal.valueOf(180)) > 0
                || latitude.compareTo(BigDecimal.valueOf(-90)) < 0
                || latitude.compareTo(BigDecimal.valueOf(90)) > 0) {
            throw new InvalidRequestException("WGS84 coordinates are outside their valid ranges");
        }
        Point point = WGS84_GEOMETRY_FACTORY.createPoint(
                new Coordinate(longitude.doubleValue(), latitude.doubleValue()));
        point.setSRID(4326);
        return point;
    }

    private void requireReadAccess(Lot lot) {
        try {
            if (lot.getFarmer() != null) {
                accessControlService.requireFarmerAccess(lot.getFarmer().getUser().getId());
            } else {
                accessControlService.requireOrganizationAccess(lot.getOrganization().getId());
            }
        } catch (AccessDeniedException exception) {
            throw new ResourceNotFoundException("Lot");
        }
    }

    private void requireWriteAccess(Lot lot) {
        if (lot.getFarmer() != null) {
            accessControlService.requireFarmerAccess(lot.getFarmer().getUser().getId());
        } else {
            accessControlService.requireOrganizationRole(lot.getOrganization().getId(), Role.FPO_USER);
        }
    }
}