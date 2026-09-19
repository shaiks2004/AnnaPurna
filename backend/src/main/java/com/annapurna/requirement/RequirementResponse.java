package com.annapurna.requirement;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RequirementResponse(
        UUID id,
        UUID buyerProfileId,
        UUID buyerOrganizationId,
        UUID commodityId,
        BigDecimal quantity,
        String quantityUnit,
        String qualitySpecification,
        String deliveryLocation,
        LocalDate requiredBy,
        BigDecimal targetPrice,
        BigDecimal maximumPrice,
        String currencyCode,
        RequirementStatus status,
        String notes,
        long version,
        Instant createdAt,
        Instant updatedAt) {
    public static RequirementResponse from(Requirement requirement) {
        if (requirement == null) {
            throw new IllegalArgumentException("Requirement is required");
        }
        return new RequirementResponse(
                requirement.getId(),
                requirement.getBuyerProfileId(),
                requirement.getBuyerOrganizationId(),
                requirement.getCommodity() == null ? null : requirement.getCommodity().getId(),
                requirement.getQuantity(),
                requirement.getQuantityUnit(),
                requirement.getQualitySpecification(),
                requirement.getDeliveryLocation(),
                requirement.getRequiredBy(),
                requirement.getTargetPrice(),
                requirement.getMaximumPrice(),
                requirement.getCurrencyCode(),
                requirement.getStatus(),
                requirement.getNotes(),
                requirement.getVersion(),
                requirement.getCreatedAt(),
                requirement.getUpdatedAt());
    }
}
