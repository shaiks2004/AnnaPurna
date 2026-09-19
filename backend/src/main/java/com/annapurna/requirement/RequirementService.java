package com.annapurna.requirement;

import com.annapurna.auth.AccessControlService;
import com.annapurna.auth.Role;
import com.annapurna.buyer.BuyerProfile;
import com.annapurna.buyer.BuyerProfileRepository;
import com.annapurna.commodity.Commodity;
import com.annapurna.commodity.CommodityRepository;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.Pagination;
import com.annapurna.common.web.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RequirementService {
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));

    private final RequirementRepository requirementRepository;
    private final CommodityRepository commodityRepository;
    private final BuyerProfileRepository buyerProfileRepository;
    private final AccessControlService accessControlService;

    public RequirementService(
            RequirementRepository requirementRepository,
            CommodityRepository commodityRepository,
            BuyerProfileRepository buyerProfileRepository,
            AccessControlService accessControlService) {
        this.requirementRepository = requirementRepository;
        this.commodityRepository = commodityRepository;
        this.buyerProfileRepository = buyerProfileRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public Page<RequirementResponse> list(
            UUID buyerOrganizationId,
            UUID commodityId,
            RequirementStatus status,
            LocalDate requiredBy,
            int page,
            int size) {
        var caller = accessControlService.current();
        boolean unrestricted = caller.hasGlobalRole(Role.ADMIN);
        Set<UUID> organizationIds = caller.organizationIds().isEmpty() ? Set.of() : caller.organizationIds();
        return requirementRepository.search(
                buyerOrganizationId,
                commodityId,
                status,
                requiredBy,
                unrestricted,
                organizationIds,
                Pagination.of(page, size, DEFAULT_SORT)).map(RequirementResponse::from);
    }

    @Transactional(readOnly = true)
    public RequirementResponse get(UUID id) {
        Requirement requirement = find(id);
        requireReadAccess(requirement);
        return RequirementResponse.from(requirement);
    }

    @Transactional
    public RequirementResponse create(RequirementCreateRequest request) {
        validatePositiveQuantity(request.quantity());
        validateRequiredBy(request.requiredBy());
        Commodity commodity = commodityRepository.findById(request.commodityId())
                .orElseThrow(() -> new ResourceNotFoundException("Commodity"));
        BuyerProfile buyerProfile = buyerProfileRepository.findById(request.buyerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile"));
        if (buyerProfile.getOrganization() == null) {
            throw new ResourceNotFoundException("Buyer profile");
        }
        accessControlService.requireOrganizationRole(buyerProfile.getOrganization().getId(), Role.BUYER_USER);
        Requirement requirement = Requirement.create(
                buyerProfile,
                commodity,
                request.quantity(),
                request.quantityUnit().trim(),
                request.qualitySpecification().trim(),
                request.deliveryLocation().trim(),
                request.requiredBy(),
                request.targetPrice(),
                request.maximumPrice(),
                request.currencyCode() == null ? null : request.currencyCode().trim().toUpperCase(),
                request.notes());
        return RequirementResponse.from(requirementRepository.save(requirement));
    }

    @Transactional
    public RequirementResponse update(UUID id, RequirementPatchRequest request) {
        if (!request.hasChanges()) {
            throw new InvalidRequestException("At least one requirement field must be supplied");
        }
        Requirement requirement = find(id);
        requireWriteAccess(requirement);
        if (requirement.getStatus() != RequirementStatus.DRAFT) {
            throw new InvalidRequestException("Only draft requirements can be edited");
        }
        if (request.quantity() != null) {
            validatePositiveQuantity(request.quantity());
        }
        if (request.requiredBy() != null) {
            validateRequiredBy(request.requiredBy());
        }
        String quantityUnit = request.quantityUnit() == null ? requirement.getQuantityUnit() : request.quantityUnit().trim();
        String qualitySpecification = request.qualitySpecification() == null
            ? requirement.getQualitySpecification() : request.qualitySpecification().trim();
        String deliveryLocation = request.deliveryLocation() == null
            ? requirement.getDeliveryLocation() : request.deliveryLocation().trim();
        String currencyCode = request.currencyCode() == null
            ? requirement.getCurrencyCode() : request.currencyCode().trim().toUpperCase();
        validateNonBlank(quantityUnit, "Quantity unit");
        validateNonBlank(qualitySpecification, "Quality specification");
        validateNonBlank(deliveryLocation, "Delivery location");
        validateCurrencyCode(currencyCode);
        BigDecimal targetPrice = request.targetPrice() == null ? requirement.getTargetPrice() : request.targetPrice();
        BigDecimal maximumPrice = request.maximumPrice() == null ? requirement.getMaximumPrice() : request.maximumPrice();
        validatePriceRange(targetPrice, maximumPrice);
        requirement.updateDraft(
                request.quantity() == null ? requirement.getQuantity() : request.quantity(),
            quantityUnit,
            qualitySpecification,
            deliveryLocation,
                request.requiredBy() == null ? requirement.getRequiredBy() : request.requiredBy(),
            targetPrice,
            maximumPrice,
            currencyCode,
                request.notes() == null ? requirement.getNotes() : request.notes());
        return RequirementResponse.from(requirement);
    }

    @Transactional
    public RequirementResponse publish(UUID id) {
        Requirement requirement = find(id);
        requireWriteAccess(requirement);
        try {
            requirement.publish();
        } catch (IllegalStateException ex) {
            throw new InvalidRequestException(ex.getMessage());
        }
        return RequirementResponse.from(requirementRepository.save(requirement));
    }

    @Transactional
    public RequirementResponse close(UUID id) {
        Requirement requirement = find(id);
        requireWriteAccess(requirement);
        try {
            requirement.close();
        } catch (IllegalStateException ex) {
            throw new InvalidRequestException(ex.getMessage());
        }
        return RequirementResponse.from(requirementRepository.save(requirement));
    }

    @Transactional
    public RequirementResponse open(UUID id) {
        Requirement requirement = find(id);
        requireWriteAccess(requirement);
        try {
            requirement.open();
        } catch (IllegalStateException ex) {
            throw new InvalidRequestException(ex.getMessage());
        }
        return RequirementResponse.from(requirementRepository.save(requirement));
    }

    private Requirement find(UUID id) {
        return requirementRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Requirement"));
    }

    private void requireReadAccess(Requirement requirement) {
        try {
            accessControlService.requireOrganizationAccess(requirement.getBuyerOrganizationId());
        } catch (AccessDeniedException ex) {
            throw new ResourceNotFoundException("Requirement");
        }
    }

    private void requireWriteAccess(Requirement requirement) {
        accessControlService.requireOrganizationRole(requirement.getBuyerOrganizationId(), Role.BUYER_USER);
    }

    private static void validatePositiveQuantity(BigDecimal quantity) {
        if (quantity == null || quantity.signum() <= 0) {
            throw new InvalidRequestException("Requirement quantity must be positive");
        }
    }

    private static void validateRequiredBy(LocalDate requiredBy) {
        if (requiredBy == null || requiredBy.isBefore(LocalDate.now())) {
            throw new InvalidRequestException("Required-by date must be today or in the future");
        }
    }

    private static void validateNonBlank(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new InvalidRequestException(field + " is required");
        }
    }

    private static void validateCurrencyCode(String currencyCode) {
        if (currencyCode != null && !currencyCode.matches("[A-Z]{3}")) {
            throw new InvalidRequestException("Currency code must be a three-letter code");
        }
    }

    private static void validatePriceRange(BigDecimal targetPrice, BigDecimal maximumPrice) {
        if (targetPrice != null && maximumPrice != null && maximumPrice.compareTo(targetPrice) < 0) {
            throw new InvalidRequestException("Maximum price must be greater than or equal to target price");
        }
    }
}
