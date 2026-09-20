package com.annapurna.matching;

import java.math.BigDecimal;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "annapurna.matching.baseline")
public class BaselineMatchWeights {
    private BigDecimal commodity = new BigDecimal("0.35");
    private BigDecimal quantity = new BigDecimal("0.30");
    private BigDecimal quality = new BigDecimal("0.20");
    private BigDecimal geography = new BigDecimal("0.10");
    private BigDecimal delivery = new BigDecimal("0.05");

    public BigDecimal getCommodity() { return commodity; }
    public void setCommodity(BigDecimal commodity) { this.commodity = commodity; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getQuality() { return quality; }
    public void setQuality(BigDecimal quality) { this.quality = quality; }
    public BigDecimal getGeography() { return geography; }
    public void setGeography(BigDecimal geography) { this.geography = geography; }
    public BigDecimal getDelivery() { return delivery; }
    public void setDelivery(BigDecimal delivery) { this.delivery = delivery; }
}
