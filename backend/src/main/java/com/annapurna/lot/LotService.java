package com.annapurna.lot;

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
import com.annapurna.supply.Supply;
import com.annapurna.supply.SupplyRepository;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LotService {
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("id"));

    private final LotRepository lotRepository;
    private final SupplyRepository supplyRepository;
    private final CommodityRepository commodityRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final FpoProfileRepository fpoProfileRepository;
    private final AccessControlService accessControlService;

    public LotService(
            LotRepository lotRepository,
            SupplyRepository supplyRepository,
            CommodityRepository commodityRepository,
            FarmerProfileRepository farmerProfileRepository,
            OrganizationRepository organizationRepository,
            FpoProfileRepository fpoProfileRepository,
            AccessControlService accessControlService) {
        this.lotRepository = lotRepository;
        this.supplyRepository = supplyRepository;
        this.commodityRepository = commodityRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.organizationRepository = organizationRepository;
        this.fpoProfileRepository = fpoProfileRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public Page<LotResponse> list(
            String search,
            UUID commodityId,
            UUID farmerId,
            UUID organizationId,
            UUID sourceSupplyId,
            LotStatus status,
            LocalDate availableFrom,
            LocalDate availableTo,
            int page,
            int size) {
        if (availableFrom != null && availableTo != null && availableFrom.isAfter(availableTo)) {
            throw new InvalidRequestException("The available-from start date cannot be after the end date");
        }
        var caller = accessControlService.current();
        boolean unrestricted = caller.hasGlobalRole(Role.ADMIN);
        Set<UUID> organizationIds = caller.organizationIds().isEmpty()
                ? Set.of(UUID.randomUUID())
                : caller.organizationIds();
        return lotRepository.search(
                        normalize(search), commodityId, farmerId, organizationId, sourceSupplyId, status,
                        availableFrom, availableTo, unrestricted, caller.userId(), organizationIds,
                        Pagination.of(page, size, DEFAULT_SORT))
                .map(LotResponse::from);
    }

    @Transactional(readOnly = true)
    public LotResponse get(UUID id) {
        Lot lot = find(id);
        requireReadAccess(lot);
        return LotResponse.from(lot);
    }

    @Transactional
    public LotResponse create(LotCreateRequest request) {
        validateQuantity(request.quantity());
        Commodity commodity = commodityRepository.findById(request.commodityId())
                .orElseThrow(() -> new ResourceNotFoundException("Commodity"));
        SupplierTarget supplier = resolveSupplier(request.farmerId(), request.organizationId());
        Supply sourceSupply = request.sourceSupplyId() == null ? null : supplyRepository.findById(request.sourceSupplyId())
                .orElseThrow(() -> new ResourceNotFoundException("Supply"));
        validateSourceSupply(sourceSupply, commodity, supplier);
        Lot lot = Lot.create(
                request.lotNumber().trim(), commodity, sourceSupply, supplier.farmer(), supplier.organization(),
                request.quantity(), request.quantityUnit().trim(), request.harvestDate(), request.availableFrom());
        return LotResponse.from(lotRepository.save(lot));
    }

    @Transactional
    public LotResponse update(UUID id, LotPatchRequest request) {
        if (!request.hasChanges()) {
            throw new InvalidRequestException("At least one lot field must be supplied");
        }
        Lot lot = find(id);
        requireWriteAccess(lot);
        if (request.quantity() != null) {
            validateQuantity(request.quantity());
        }
        if (lot.getStatus() != LotStatus.DECLARED) {
            throw new InvalidRequestException("Only DECLARED lots can be edited");
        }
        lot.update(
                request.quantity() == null ? lot.getQuantity() : request.quantity(),
                request.quantityUnit() == null ? lot.getQuantityUnit() : request.quantityUnit().trim(),
                request.harvestDate() == null ? lot.getHarvestDate() : request.harvestDate(),
                request.availableFrom() == null ? lot.getAvailableFrom() : request.availableFrom());
        return LotResponse.from(lot);
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

    private void validateSourceSupply(Supply sourceSupply, Commodity commodity, SupplierTarget supplier) {
        if (sourceSupply == null) {
            return;
        }
        if (!sourceSupply.getCommodity().getId().equals(commodity.getId())) {
            throw new InvalidRequestException("Source supply commodity does not match the lot commodity");
        }
        boolean sameFarmer = supplier.farmer() != null
                && sourceSupply.getFarmer() != null
                && sourceSupply.getFarmer().getId().equals(supplier.farmer().getId());
        boolean sameOrganization = supplier.organization() != null
                && sourceSupply.getOrganization() != null
                && sourceSupply.getOrganization().getId().equals(supplier.organization().getId());
        if (!sameFarmer && !sameOrganization) {
            throw new InvalidRequestException("Source supply supplier does not match the lot supplier");
        }
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

    private Lot find(UUID id) {
        return lotRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lot"));
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static void validateQuantity(java.math.BigDecimal quantity) {
        if (quantity == null || quantity.signum() <= 0) {
            throw new InvalidRequestException("Lot quantity must be positive");
        }
    }

    private record SupplierTarget(FarmerProfile farmer, Organization organization) {}
}