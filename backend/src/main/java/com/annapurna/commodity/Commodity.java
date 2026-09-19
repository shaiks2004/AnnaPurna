package com.annapurna.commodity;

import com.annapurna.common.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "commodity")
public class Commodity extends AuditableEntity {
    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "commodity_code", unique = true)
    private String commodityCode;

    @Column(nullable = false)
    private boolean active;

    protected Commodity() {}

    public static Commodity create(String name, String code, boolean active) {
        Commodity commodity = new Commodity();
        commodity.name = name;
        commodity.commodityCode = code;
        commodity.active = active;
        return commodity;
    }

    public void update(String name, String code, boolean active) {
        this.name = name;
        this.commodityCode = code;
        this.active = active;
    }

    public String getName() { return name; }
    public String getCommodityCode() { return commodityCode; }
    public boolean isActive() { return active; }
}
