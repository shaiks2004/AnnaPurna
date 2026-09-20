package com.annapurna.lot;

import com.annapurna.common.persistence.AuditableEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "lot_location")
public class LotLocation extends AuditableEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_id", nullable = false, unique = true)
    private Lot lot;

    @JdbcTypeCode(SqlTypes.GEOMETRY)
    @jakarta.persistence.Column(nullable = false, columnDefinition = "geometry(Point,4326)")
    private Point location;

    protected LotLocation() {}

    public static LotLocation create(Lot lot, Point location) {
        LotLocation lotLocation = new LotLocation();
        lotLocation.lot = lot;
        lotLocation.location = location;
        return lotLocation;
    }

    public Lot getLot() { return lot; }
    public Point getLocation() { return location; }

    public void update(Point location) {
        this.location = location;
    }
}
