package com.annapurna.lot;

import com.annapurna.commodity.Commodity;
import com.annapurna.common.persistence.AuditableEntity;
import com.annapurna.farmer.FarmerProfile;
import com.annapurna.organization.Organization;
import com.annapurna.supply.Supply;
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
@Table(name = "lot")
public class Lot extends AuditableEntity {
    @Column(name = "lot_number", nullable = false, unique = true, length = 64)
    private String lotNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_supply_id")
    private Supply sourceSupply;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private FarmerProfile farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantity;

    @Column(name = "quantity_unit", nullable = false, length = 32)
    private String quantityUnit;

    @Column(name = "harvest_date")
    private LocalDate harvestDate;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_code", nullable = false, length = 32)
    private LotStatus status;

    protected Lot() {}

    public String getLotNumber() { return lotNumber; }
    public Commodity getCommodity() { return commodity; }
    public Supply getSourceSupply() { return sourceSupply; }
    public FarmerProfile getFarmer() { return farmer; }
    public Organization getOrganization() { return organization; }
    public BigDecimal getQuantity() { return quantity; }
    public String getQuantityUnit() { return quantityUnit; }
    public LocalDate getHarvestDate() { return harvestDate; }
    public LocalDate getAvailableFrom() { return availableFrom; }
    public LotStatus getStatus() { return status; }

    public static Lot create(
            String lotNumber,
            Commodity commodity,
            Supply sourceSupply,
            FarmerProfile farmer,
            Organization organization,
            BigDecimal quantity,
            String quantityUnit,
            LocalDate harvestDate,
            LocalDate availableFrom) {
        Lot lot = new Lot();
        lot.lotNumber = lotNumber;
        lot.commodity = commodity;
        lot.sourceSupply = sourceSupply;
        lot.farmer = farmer;
        lot.organization = organization;
        lot.quantity = quantity;
        lot.quantityUnit = quantityUnit;
        lot.harvestDate = harvestDate;
        lot.availableFrom = availableFrom;
        lot.status = LotStatus.DECLARED;
        return lot;
    }

    public void update(
            BigDecimal quantity,
            String quantityUnit,
            LocalDate harvestDate,
            LocalDate availableFrom) {
        this.quantity = quantity;
        this.quantityUnit = quantityUnit;
        this.harvestDate = harvestDate;
        this.availableFrom = availableFrom;
    }
}
