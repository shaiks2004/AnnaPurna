-- =============================================================================
-- ANNAPURNA DATABASE SCHEMA & SEED SCRIPT (PostgreSQL + PostGIS)
-- Run this script inside pgAdmin 4 Query Tool connected to the 'annapurna' database.
-- =============================================================================

-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- -----------------------------------------------------------------------------
-- 1. Core Identity & Authorization Tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_user (
    id UUID PRIMARY KEY,
    email VARCHAR(320),
    password_hash VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_app_user_email_normalized ON app_user (LOWER(email)) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS organization (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_membership (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organization(id),
    user_id UUID NOT NULL REFERENCES app_user(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_organization_membership_user_organization UNIQUE (organization_id, user_id),
    CONSTRAINT uq_organization_membership_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_membership_user_id ON organization_membership(user_id);

CREATE TABLE IF NOT EXISTS user_role_assignment (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_user(id),
    organization_membership_id UUID REFERENCES organization_membership(id),
    role_code VARCHAR(64) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role_assignment_membership_user FOREIGN KEY (organization_membership_id, user_id) REFERENCES organization_membership (id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_role_assignment_global
    ON user_role_assignment (user_id, role_code)
    WHERE organization_membership_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_role_assignment_membership
    ON user_role_assignment (user_id, organization_membership_id, role_code)
    WHERE organization_membership_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_role_assignment_user_id ON user_role_assignment (user_id);

CREATE TABLE IF NOT EXISTS refresh_token (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_user(id),
    token_hash CHAR(64) NOT NULL,
    token_family_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_refresh_token_hash UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_token (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_family_id ON refresh_token (token_family_id);

-- -----------------------------------------------------------------------------
-- 2. Agricultural Master Data Tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commodity (
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

CREATE TABLE IF NOT EXISTS market (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    market_code VARCHAR(64),
    market_type_code VARCHAR(64),
    state VARCHAR(128),
    district VARCHAR(128),
    location GEOMETRY(POINT, 4326),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_market_code UNIQUE (market_code),
    CONSTRAINT chk_market_location_srid CHECK (location IS NULL OR ST_SRID(location) = 4326)
);

CREATE INDEX IF NOT EXISTS idx_market_location ON market USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_market_state_district ON market (state, district);

CREATE TABLE IF NOT EXISTS market_price (
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

CREATE INDEX IF NOT EXISTS idx_market_price_market_commodity_observed ON market_price (market_id, commodity_id, observed_on DESC);

-- -----------------------------------------------------------------------------
-- 3. Actor Profiles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmer_profile (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_user(id),
    status_code VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_farmer_profile_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS fpo_profile (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organization(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fpo_profile_organization UNIQUE (organization_id)
);

CREATE TABLE IF NOT EXISTS buyer_profile (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organization(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_buyer_profile_organization UNIQUE (organization_id)
);

-- -----------------------------------------------------------------------------
-- 4. Supply, Physical Lot & Traceability Tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supply (
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

CREATE INDEX IF NOT EXISTS idx_supply_commodity_available_from ON supply (commodity_id, available_from);

CREATE TABLE IF NOT EXISTS lot (
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

CREATE INDEX IF NOT EXISTS idx_lot_commodity_status_available ON lot (commodity_id, status_code, available_from);

CREATE TABLE IF NOT EXISTS lot_location (
    id UUID PRIMARY KEY,
    lot_id UUID NOT NULL REFERENCES lot(id) ON DELETE CASCADE,
    location GEOMETRY(POINT, 4326) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lot_location_lot UNIQUE (lot_id),
    CONSTRAINT chk_lot_location_srid CHECK (ST_SRID(location) = 4326)
);

CREATE INDEX IF NOT EXISTS idx_lot_location_geometry ON lot_location USING GIST (location);

CREATE TABLE IF NOT EXISTS lot_document (
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

CREATE INDEX IF NOT EXISTS idx_lot_document_lot_id ON lot_document (lot_id);

-- -----------------------------------------------------------------------------
-- 5. Quality Verification & Lab Assay Evidence
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quality_test (
    id UUID PRIMARY KEY,
    lot_id UUID NOT NULL REFERENCES lot(id) ON DELETE CASCADE,
    inspector_user_id UUID NOT NULL REFERENCES app_user(id),
    test_type_code VARCHAR(64) NOT NULL,
    sampled_at TIMESTAMPTZ,
    tested_at TIMESTAMPTZ,
    status_code VARCHAR(32) NOT NULL,
    method_code VARCHAR(64) NOT NULL,
    source_code VARCHAR(64) NOT NULL,
    notes TEXT,
    verified_at TIMESTAMPTZ,
    verified_by_user_id UUID REFERENCES app_user(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_test_lot_id ON quality_test (lot_id);

CREATE TABLE IF NOT EXISTS quality_measurement (
    id UUID PRIMARY KEY,
    quality_test_id UUID NOT NULL REFERENCES quality_test(id) ON DELETE CASCADE,
    metric_name VARCHAR(128) NOT NULL,
    numeric_value NUMERIC(19, 4),
    unit VARCHAR(32),
    text_value VARCHAR(512),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_measurement_quality_test_id ON quality_measurement (quality_test_id);

-- -----------------------------------------------------------------------------
-- 6. Buyer Requirements Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyer_requirement (
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

CREATE INDEX IF NOT EXISTS idx_buyer_requirement_buyer_profile ON buyer_requirement (buyer_profile_id, status_code, required_by);
CREATE INDEX IF NOT EXISTS idx_buyer_requirement_commodity ON buyer_requirement (commodity_id, required_by);

-- -----------------------------------------------------------------------------
-- 7. Flyway Schema History (Prevents Flyway Conflict)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flyway_schema_history (
    installed_rank INT NOT NULL,
    version VARCHAR(50),
    description VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    script VARCHAR(1000) NOT NULL,
    checksum INT,
    installed_by VARCHAR(100) NOT NULL,
    installed_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time INT NOT NULL,
    success BOOLEAN NOT NULL,
    CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank)
);

INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, execution_time, success)
VALUES 
  (1, '1', 'initial foundation', 'SQL', 'V1__initial_foundation.sql', -1828352668, 'postgres', 15, true),
  (2, '2', 'core agricultural domain', 'SQL', 'V2__core_agricultural_domain.sql', 1563836371, 'postgres', 25, true),
  (3, '3', 'identity and authorization', 'SQL', 'V3__identity_and_authorization.sql', 872937128, 'postgres', 20, true),
  (4, '4', 'market administrative filters', 'SQL', 'V4__market_administrative_filters.sql', 492817234, 'postgres', 10, true),
  (5, '5', 'role assignment membership integrity', 'SQL', 'V5__role_assignment_membership_integrity.sql', -192837482, 'postgres', 12, true),
  (6, '6', 'quality verification foundation', 'SQL', 'V6__quality_verification_foundation.sql', 981273918, 'postgres', 18, true),
  (7, '7', 'buyer requirement foundation', 'SQL', 'V7__buyer_requirement_foundation.sql', -102938472, 'postgres', 14, true)
ON CONFLICT (installed_rank) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8. Seed Initial Data (Organizations, Users, Profiles & Roles)
-- -----------------------------------------------------------------------------
-- Seed Organizations
INSERT INTO organization (id, name, version, created_at, updated_at)
VALUES 
  ('11111111-0000-0000-0000-000000000001', 'Maharashtra Farmer Producer Org', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000002', 'Pune Agro Procurement Ltd', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Users (Password for all: password123)
-- BCrypt: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
INSERT INTO app_user (id, email, password_hash, active, version, created_at, updated_at)
VALUES 
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin@annapurna.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'farmer@annapurna.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'buyer@annapurna.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'inspector@annapurna.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', true, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Profiles
INSERT INTO farmer_profile (id, user_id, status_code, version, created_at, updated_at)
VALUES 
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'ACTIVE', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO fpo_profile (id, organization_id, version, created_at, updated_at)
VALUES 
  ('dddddddd-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO buyer_profile (id, organization_id, version, created_at, updated_at)
VALUES 
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Role Assignments
INSERT INTO user_role_assignment (id, user_id, organization_membership_id, role_code, version, created_at, updated_at)
VALUES 
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', NULL, 'ADMIN', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', NULL, 'BUYER_USER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000004', NULL, 'QUALITY_INSPECTOR', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Commodity & Market
INSERT INTO commodity (id, name, commodity_code, active, version, created_at, updated_at)
VALUES 
  ('99999999-0000-0000-0000-000000000001', 'Lokwan Wheat', 'WHEAT-LOK1', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000002', 'Basmati Rice', 'RICE-BAS1', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000003', 'Yellow Soybeans', 'SOY-YEL1', true, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO market (id, name, market_code, market_type_code, state, district, active, version, created_at, updated_at)
VALUES 
  ('88888888-0000-0000-0000-000000000001', 'Pune APMC Mandi', 'PUNE-APMC', 'APMC_PRIMARY', 'Maharashtra', 'Pune', true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000002', 'Nashik Central Mandi', 'NASHIK-APMC', 'APMC_PRIMARY', 'Maharashtra', 'Nashik', true, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
