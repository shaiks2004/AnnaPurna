CREATE TABLE buyer_requirement (
    id UUID PRIMARY KEY,
    buyer_profile_id UUID NOT NULL REFERENCES buyer_profile(id),
    commodity_id UUID NOT NULL REFERENCES commodity(id),
    quantity NUMERIC(19, 3) NOT NULL,
    quantity_unit VARCHAR(32) NOT NULL,
    quality_specification TEXT NOT NULL,
    delivery_location VARCHAR(512) NOT NULL,
    required_by DATE NOT NULL,
    target_price NUMERIC(19, 4),
    maximum_price NUMERIC(19, 4),
    currency_code CHAR(3),
    status_code VARCHAR(32) NOT NULL,
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_buyer_requirement_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_buyer_requirement_price_range CHECK (
        (target_price IS NULL OR maximum_price IS NULL OR maximum_price >= target_price)
    )
);

CREATE INDEX idx_buyer_requirement_buyer_profile ON buyer_requirement (buyer_profile_id, status_code, required_by);
CREATE INDEX idx_buyer_requirement_commodity ON buyer_requirement (commodity_id, required_by);
