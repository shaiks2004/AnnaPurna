package com.annapurna.marketprice;

import com.annapurna.commodity.Commodity;
import com.annapurna.market.Market;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "market_price")
public class MarketPrice {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @Column(name = "observed_on", nullable = false)
    private LocalDate observedOn;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "min_price", precision = 19, scale = 4)
    private BigDecimal minPrice;

    @Column(name = "max_price", precision = 19, scale = 4)
    private BigDecimal maxPrice;

    @Column(name = "modal_price", precision = 19, scale = 4)
    private BigDecimal modalPrice;

    @Column(name = "currency_code", length = 3)
    private String currencyCode;

    @Column(name = "price_unit", nullable = false, length = 32)
    private String priceUnit;

    @Column(name = "arrival_quantity", precision = 19, scale = 3)
    private BigDecimal arrivalQuantity;

    @Column(name = "arrival_quantity_unit", length = 32)
    private String arrivalQuantityUnit;

    @Column(name = "source_name", nullable = false)
    private String sourceName;

    @Column(name = "source_reference", length = 512)
    private String sourceReference;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected MarketPrice() {}

        public static MarketPrice create(Commodity commodity, Market market, LocalDate observedOn,
            LocalDate periodStart, LocalDate periodEnd, BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal modalPrice, String currencyCode, String priceUnit,
            BigDecimal arrivalQuantity, String arrivalQuantityUnit, String sourceName, String sourceReference) {
        MarketPrice price = new MarketPrice();
        price.commodity = commodity;
        price.market = market;
        price.observedOn = observedOn;
        price.periodStart = periodStart;
        price.periodEnd = periodEnd;
        price.minPrice = minPrice;
        price.maxPrice = maxPrice;
        price.modalPrice = modalPrice;
        price.currencyCode = currencyCode;
        price.priceUnit = priceUnit;
        price.arrivalQuantity = arrivalQuantity;
        price.arrivalQuantityUnit = arrivalQuantityUnit;
        price.sourceName = sourceName;
        price.sourceReference = sourceReference;
        return price;
    }

    public UUID getId() { return id; }
    public Commodity getCommodity() { return commodity; }
    public Market getMarket() { return market; }
    public LocalDate getObservedOn() { return observedOn; }
    public LocalDate getPeriodStart() { return periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public BigDecimal getMinPrice() { return minPrice; }
    public BigDecimal getMaxPrice() { return maxPrice; }
    public BigDecimal getModalPrice() { return modalPrice; }
    public String getCurrencyCode() { return currencyCode; }
    public String getPriceUnit() { return priceUnit; }
    public BigDecimal getArrivalQuantity() { return arrivalQuantity; }
    public String getArrivalQuantityUnit() { return arrivalQuantityUnit; }
    public String getSourceName() { return sourceName; }
    public String getSourceReference() { return sourceReference; }
    public Instant getCreatedAt() { return createdAt; }

    @PrePersist
    void assignIdAndTimestamp() {
        id = UUID.randomUUID();
        createdAt = Instant.now();
    }
}
