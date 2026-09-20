CREATE TABLE commodity (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    commodity_code VARCHAR(64),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_commodity_name UNIQUE (name),
    CONSTRAINT uq_commodity_code UNIQUE (commodity_code)
);

CREATE TABLE market (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    market_code VARCHAR(64),
    market_type_code VARCHAR(64),
    location GEOMETRY(POINT, 4326),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_market_code UNIQUE (market_code),
    CONSTRAINT chk_market_location_srid CHECK (location IS NULL OR ST_SRID(location) = 4326)
);

CREATE INDEX idx_market_location ON market USING GIST (location);

CREATE TABLE market_price (
    id UUID PRIMARY KEY,
    commodity_id UUID NOT NULL REFERENCES commodity(id),
    market_id UUID NOT NULL REFERENCES market(id),
    observed_on DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    min_price NUMERIC(19, 4),
    max_price NUMERIC(19, 4),
    modal_price NUMERIC(19, 4),
    currency_code CHAR(3),
    price_unit VARCHAR(32) NOT NULL,
    arrival_quantity NUMERIC(19, 3),
    arrival_quantity_unit VARCHAR(32),
    source_name VARCHAR(255) NOT NULL,
    source_reference VARCHAR(512),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_market_price_range CHECK (min_price IS NULL OR max_price IS NULL OR min_price <= max_price),
    CONSTRAINT chk_market_price_period CHECK (period_end IS NULL OR period_start IS NULL OR period_start <= period_end),
    CONSTRAINT chk_market_price_arrival_quantity CHECK (arrival_quantity IS NULL OR arrival_quantity >= 0)
);

CREATE INDEX idx_market_price_market_commodity_observed ON market_price (market_id, commodity_id, observed_on DESC);
CREATE INDEX idx_market_price_source_reference ON market_price (source_name, source_reference);

CREATE TABLE farmer_profile (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_user(id),
    status_code VARCHAR(32) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_farmer_profile_user UNIQUE (user_id)
);

CREATE TABLE fpo_profile (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organization(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fpo_profile_organization UNIQUE (organization_id)
);

CREATE TABLE buyer_profile (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organization(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_buyer_profile_organization UNIQUE (organization_id)
);

CREATE TABLE supply (
    id UUID PRIMARY KEY,
    commodity_id UUID NOT NULL REFERENCES commodity(id),
    farmer_id UUID REFERENCES farmer_profile(id),
    organization_id UUID REFERENCES organization(id),
    supply_kind_code VARCHAR(32) NOT NULL,
    quantity NUMERIC(19, 3) NOT NULL,
    quantity_unit VARCHAR(32) NOT NULL,
    expected_harvest_date DATE,
    available_from DATE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_supply_supplier CHECK ((farmer_id IS NOT NULL) <> (organization_id IS NOT NULL)),
    CONSTRAINT chk_supply_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_supply_commodity_available_from ON supply (commodity_id, available_from);
CREATE INDEX idx_supply_farmer_id ON supply (farmer_id) WHERE farmer_id IS NOT NULL;
CREATE INDEX idx_supply_organization_id ON supply (organization_id) WHERE organization_id IS NOT NULL;

CREATE TABLE lot (
    id UUID PRIMARY KEY,
    lot_number VARCHAR(64) NOT NULL,
    commodity_id UUID NOT NULL REFERENCES commodity(id),
    source_supply_id UUID REFERENCES supply(id),
    farmer_id UUID REFERENCES farmer_profile(id),
    organization_id UUID REFERENCES organization(id),
    quantity NUMERIC(19, 3) NOT NULL,
    quantity_unit VARCHAR(32) NOT NULL,
    harvest_date DATE,
    available_from DATE,
    status_code VARCHAR(32) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lot_number UNIQUE (lot_number),
    CONSTRAINT chk_lot_supplier CHECK ((farmer_id IS NOT NULL) <> (organization_id IS NOT NULL)),
    CONSTRAINT chk_lot_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_lot_commodity_status_available ON lot (commodity_id, status_code, available_from);
CREATE INDEX idx_lot_source_supply_id ON lot (source_supply_id) WHERE source_supply_id IS NOT NULL;

CREATE TABLE lot_location (
    id UUID PRIMARY KEY,
    lot_id UUID NOT NULL REFERENCES lot(id) ON DELETE CASCADE,
    location GEOMETRY(POINT, 4326) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lot_location_lot UNIQUE (lot_id),
    CONSTRAINT chk_lot_location_srid CHECK (ST_SRID(location) = 4326)
);

CREATE INDEX idx_lot_location_geometry ON lot_location USING GIST (location);

CREATE TABLE lot_document (
    id UUID PRIMARY KEY,
    lot_id UUID NOT NULL REFERENCES lot(id) ON DELETE CASCADE,
    document_type_code VARCHAR(64) NOT NULL,
    storage_reference VARCHAR(1024) NOT NULL,
    original_filename VARCHAR(512),
    content_type VARCHAR(255),
    checksum VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lot_document_storage_reference UNIQUE (storage_reference)
);

CREATE INDEX idx_lot_document_lot_id ON lot_document (lot_id);
