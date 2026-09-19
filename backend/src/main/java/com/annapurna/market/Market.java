package com.annapurna.market;

import com.annapurna.common.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "market")
public class Market extends AuditableEntity {
    @Column(nullable = false)
    private String name;

    @Column(name = "market_code", unique = true)
    private String marketCode;

    @Column(name = "market_type_code")
    private String marketTypeCode;

    private String state;

    private String district;

    @JdbcTypeCode(SqlTypes.GEOMETRY)
    @Column(columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(nullable = false)
    private boolean active;

    protected Market() {}

    public static Market create(String name, String code, String typeCode, String state, String district, boolean active) {
        Market market = new Market();
        market.name = name;
        market.marketCode = code;
        market.marketTypeCode = typeCode;
        market.state = state;
        market.district = district;
        market.active = active;
        return market;
    }

    public void update(String name, String code, String typeCode, String state, String district, boolean active) {
        this.name = name;
        this.marketCode = code;
        this.marketTypeCode = typeCode;
        this.state = state;
        this.district = district;
        this.active = active;
    }

    public String getName() { return name; }
    public String getMarketCode() { return marketCode; }
    public String getMarketTypeCode() { return marketTypeCode; }
    public String getState() { return state; }
    public String getDistrict() { return district; }
    public boolean isActive() { return active; }
}
