package com.annapurna.supply;

import com.annapurna.commodity.Commodity;
import com.annapurna.common.persistence.AuditableEntity;
import com.annapurna.farmer.FarmerProfile;
import com.annapurna.organization.Organization;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "supply")
public class Supply extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private FarmerProfile farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(name = "supply_kind_code", nullable = false, length = 32)
    private SupplyKind supplyKind;

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantity;

    @Column(name = "quantity_unit", nullable = false, length = 32)
    private String quantityUnit;

    @Column(name = "expected_harvest_date")
    private LocalDate expectedHarvestDate;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    protected Supply() {}

    public Commodity getCommodity() { return commodity; }
    public FarmerProfile getFarmer() { return farmer; }
    public Organization getOrganization() { return organization; }
    public SupplyKind getSupplyKind() { return supplyKind; }
    public BigDecimal getQuantity() { return quantity; }
    public String getQuantityUnit() { return quantityUnit; }
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public LocalDate getAvailableFrom() { return availableFrom; }

    public static Supply create(
            Commodity commodity,
            FarmerProfile farmer,
            Organization organization,
            SupplyKind supplyKind,
            BigDecimal quantity,
            String quantityUnit,
            LocalDate expectedHarvestDate,
            LocalDate availableFrom) {
        Supply supply = new Supply();
        supply.commodity = commodity;
        supply.farmer = farmer;
        supply.organization = organization;
        supply.supplyKind = supplyKind;
        supply.quantity = quantity;
        supply.quantityUnit = quantityUnit;
        supply.expectedHarvestDate = expectedHarvestDate;
        supply.availableFrom = availableFrom;
        return supply;
    }

    public void update(
            SupplyKind supplyKind,
            BigDecimal quantity,
            String quantityUnit,
            LocalDate expectedHarvestDate,
            LocalDate availableFrom) {
        this.supplyKind = supplyKind;
        this.quantity = quantity;
        this.quantityUnit = quantityUnit;
        this.expectedHarvestDate = expectedHarvestDate;
        this.availableFrom = availableFrom;
    }
}
