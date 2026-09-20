package com.annapurna.supply;

import com.annapurna.auth.AccessControlService;
import com.annapurna.auth.Role;
import com.annapurna.commodity.Commodity;
import com.annapurna.commodity.CommodityRepository;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.Pagination;
import com.annapurna.common.web.ResourceNotFoundException;
import com.annapurna.farmer.FarmerProfile;
import com.annapurna.farmer.FarmerProfileRepository;
import com.annapurna.fpo.FpoProfileRepository;
import com.annapurna.organization.Organization;
import com.annapurna.organization.OrganizationRepository;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupplyService {
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("id"));

    private final SupplyRepository supplyRepository;
    private final CommodityRepository commodityRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final FpoProfileRepository fpoProfileRepository;
    private final AccessControlService accessControlService;

    public SupplyService(
            SupplyRepository supplyRepository,
            CommodityRepository commodityRepository,
            FarmerProfileRepository farmerProfileRepository,
            OrganizationRepository organizationRepository,
            FpoProfileRepository fpoProfileRepository,
            AccessControlService accessControlService) {
        this.supplyRepository = supplyRepository;
        this.commodityRepository = commodityRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.organizationRepository = organizationRepository;
        this.fpoProfileRepository = fpoProfileRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public Page<SupplyResponse> list(
            UUID commodityId,
            UUID farmerId,
            UUID organizationId,
            SupplyKind supplyKind,
            LocalDate expectedFrom,
            LocalDate expectedTo,
            LocalDate availableFrom,
            int page,
            int size) {
        validateDateRange(expectedFrom, expectedTo);
        var caller = accessControlService.current();
        boolean unrestricted = caller.hasGlobalRole(Role.ADMIN);
        Set<UUID> organizationIds = caller.organizationIds().isEmpty()
                ? Set.of(UUID.randomUUID())
                : caller.organizationIds();
        Page<Supply> supplies = supplyRepository.search(
                commodityId,
                farmerId,
                organizationId,
                supplyKind,
                expectedFrom,
                expectedTo,
                availableFrom,
                unrestricted,
                caller.userId(),
                organizationIds,
                Pagination.of(page, size, DEFAULT_SORT));
        return supplies.map(SupplyResponse::from);
    }

    @Transactional(readOnly = true)
    public SupplyResponse get(UUID id) {
        Supply supply = find(id);
        requireReadAccess(supply);
        return SupplyResponse.from(supply);
    }

    @Transactional
    public SupplyResponse create(SupplyCreateRequest request) {
        validateQuantity(request.quantity());
        Commodity commodity = commodityRepository.findById(request.commodityId())
                .orElseThrow(() -> new ResourceNotFoundException("Commodity"));
        SupplierTarget supplier = resolveSupplier(request.farmerId(), request.organizationId());
        Supply supply = Supply.create(
                commodity,
                supplier.farmer(),
                supplier.organization(),
                request.supplyKind(),
                request.quantity(),
                request.quantityUnit().trim(),
                request.expectedHarvestDate(),
                request.availableFrom());
        return SupplyResponse.from(supplyRepository.save(supply));
    }

    @Transactional
    public SupplyResponse update(UUID id, SupplyPatchRequest request) {
        if (!request.hasChanges()) {
            throw new InvalidRequestException("At least one supply field must be supplied");
        }
        Supply supply = find(id);
        requireWriteAccess(supply);
        if (request.quantity() != null) {
            validateQuantity(request.quantity());
        }
        supply.update(
                request.supplyKind() == null ? supply.getSupplyKind() : request.supplyKind(),
                request.quantity() == null ? supply.getQuantity() : request.quantity(),
                request.quantityUnit() == null ? supply.getQuantityUnit() : request.quantityUnit().trim(),
                request.expectedHarvestDate() == null
                        ? supply.getExpectedHarvestDate() : request.expectedHarvestDate(),
                request.availableFrom() == null ? supply.getAvailableFrom() : request.availableFrom());
        return SupplyResponse.from(supply);
    }

    private SupplierTarget resolveSupplier(UUID farmerId, UUID organizationId) {
        if ((farmerId != null) == (organizationId != null)) {
            throw new InvalidRequestException("Exactly one farmer or organization supplier is required");
        }
        if (farmerId != null) {
            FarmerProfile farmer = farmerProfileRepository.findById(farmerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer profile"));
            accessControlService.requireFarmerAccess(farmer.getUser().getId());
            return new SupplierTarget(farmer, null);
        }
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization"));
        if (!fpoProfileRepository.existsByOrganizationId(organizationId)) {
            throw new InvalidRequestException("Organization is not an FPO");
        }
        accessControlService.requireOrganizationRole(organizationId, Role.FPO_USER);
        return new SupplierTarget(null, organization);
    }

    private void requireReadAccess(Supply supply) {
        try {
            if (supply.getFarmer() != null) {
                accessControlService.requireFarmerAccess(supply.getFarmer().getUser().getId());
            } else {
                accessControlService.requireOrganizationAccess(supply.getOrganization().getId());
            }
        } catch (AccessDeniedException exception) {
            throw new ResourceNotFoundException("Supply");
        }
    }

    private void requireWriteAccess(Supply supply) {
        if (supply.getFarmer() != null) {
            accessControlService.requireFarmerAccess(supply.getFarmer().getUser().getId());
        } else {
            accessControlService.requireOrganizationRole(supply.getOrganization().getId(), Role.FPO_USER);
        }
    }

    private Supply find(UUID id) {
        return supplyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supply"));
    }

    private static void validateDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new InvalidRequestException("The expected-harvest start date cannot be after the end date");
        }
    }

    private static void validateQuantity(java.math.BigDecimal quantity) {
        if (quantity == null || quantity.signum() <= 0) {
            throw new InvalidRequestException("Supply quantity must be positive");
        }
    }

    private record SupplierTarget(FarmerProfile farmer, Organization organization) {}
}