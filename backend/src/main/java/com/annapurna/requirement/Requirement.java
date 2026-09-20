package com.annapurna.requirement;

import com.annapurna.buyer.BuyerProfile;
import com.annapurna.commodity.Commodity;
import com.annapurna.common.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "buyer_requirement")
public class Requirement extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_profile_id", nullable = false)
    private BuyerProfile buyerProfile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantity;

    @Column(name = "quantity_unit", nullable = false, length = 32)
    private String quantityUnit;

    @Column(name = "quality_specification", nullable = false, columnDefinition = "TEXT")
    private String qualitySpecification;

    @Column(name = "delivery_location", nullable = false, length = 512)
    private String deliveryLocation;

    @Column(name = "required_by", nullable = false)
    private LocalDate requiredBy;

    @Column(name = "target_price", precision = 19, scale = 4)
    private BigDecimal targetPrice;

    @Column(name = "maximum_price", precision = 19, scale = 4)
    private BigDecimal maximumPrice;

    @Column(name = "currency_code", length = 3)
    @JdbcTypeCode(SqlTypes.CHAR)
    private String currencyCode;

    @Column(name = "status_code", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private RequirementStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    protected Requirement() {}

    public static Requirement create(
            BuyerProfile buyerProfile,
            Commodity commodity,
            BigDecimal quantity,
            String quantityUnit,
            String qualitySpecification,
            String deliveryLocation,
            LocalDate requiredBy,
            BigDecimal targetPrice,
            BigDecimal maximumPrice,
            String currencyCode,
            String notes) {
        Requirement requirement = new Requirement();
        requirement.buyerProfile = buyerProfile;
        requirement.commodity = commodity;
        requirement.quantity = quantity;
        requirement.quantityUnit = quantityUnit;
        requirement.qualitySpecification = qualitySpecification;
        requirement.deliveryLocation = deliveryLocation;
        requirement.requiredBy = requiredBy;
        requirement.targetPrice = targetPrice;
        requirement.maximumPrice = maximumPrice;
        requirement.currencyCode = currencyCode;
        requirement.notes = notes;
        requirement.status = RequirementStatus.DRAFT;
        return requirement;
    }

    public void updateDraft(
            BigDecimal quantity,
            String quantityUnit,
            String qualitySpecification,
            String deliveryLocation,
            LocalDate requiredBy,
            BigDecimal targetPrice,
            BigDecimal maximumPrice,
            String currencyCode,
            String notes) {
        this.quantity = quantity;
        this.quantityUnit = quantityUnit;
        this.qualitySpecification = qualitySpecification;
        this.deliveryLocation = deliveryLocation;
        this.requiredBy = requiredBy;
        this.targetPrice = targetPrice;
        this.maximumPrice = maximumPrice;
        this.currencyCode = currencyCode;
        this.notes = notes;
    }

    public void publish() {
        transitionTo(RequirementStatus.PUBLISHED);
    }

    public void open() {
        transitionTo(RequirementStatus.OPEN);
    }

    public void close() {
        transitionTo(RequirementStatus.CLOSED);
    }

    public void transitionTo(RequirementStatus targetStatus) {
        if (targetStatus == null) {
            throw new IllegalArgumentException("Target status is required");
        }
        switch (this.status) {
            case DRAFT -> {
                if (targetStatus == RequirementStatus.PUBLISHED) {
                    this.status = RequirementStatus.PUBLISHED;
                    return;
                }
            }
            case PUBLISHED -> {
                if (targetStatus == RequirementStatus.OPEN) {
                    this.status = RequirementStatus.OPEN;
                    return;
                }
                if (targetStatus == RequirementStatus.CLOSED) {
                    this.status = RequirementStatus.CLOSED;
                    return;
                }
            }
            case OPEN -> {
                if (targetStatus == RequirementStatus.CLOSED) {
                    this.status = RequirementStatus.CLOSED;
                    return;
                }
            }
            case CLOSED -> {
                throw new IllegalStateException("Closed requirements cannot transition to a new lifecycle status");
            }
            default -> throw new IllegalStateException("Unsupported requirement status: " + this.status);
        }
        throw new IllegalStateException("Invalid requirement transition: " + this.status + " -> " + targetStatus);
    }

    public BuyerProfile getBuyerProfile() { return buyerProfile; }
    public UUID getBuyerProfileId() { return buyerProfile != null ? buyerProfile.getId() : null; }
    public UUID getBuyerOrganizationId() { return buyerProfile != null && buyerProfile.getOrganization() != null ? buyerProfile.getOrganization().getId() : null; }
    public Commodity getCommodity() { return commodity; }
    public BigDecimal getQuantity() { return quantity; }
    public String getQuantityUnit() { return quantityUnit; }
    public String getQualitySpecification() { return qualitySpecification; }
    public String getDeliveryLocation() { return deliveryLocation; }
    public LocalDate getRequiredBy() { return requiredBy; }
    public BigDecimal getTargetPrice() { return targetPrice; }
    public BigDecimal getMaximumPrice() { return maximumPrice; }
    public String getCurrencyCode() { return currencyCode; }
    public RequirementStatus getStatus() { return status; }
    public String getNotes() { return notes; }
    public void setStatus(RequirementStatus status) { this.status = status; }
}
