-- =============================================================================
-- ANNAPURNA PRESENTATION SEED SCRIPT
-- =============================================================================

-- Organizations
INSERT INTO organization (id, name, version, created_at, updated_at)
VALUES 
  ('11111111-0000-0000-0000-000000000001', 'Maharashtra Farmer Producer Org', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000002', 'Pune Agro Procurement Ltd', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Users (Password for all: password123)
-- BCrypt: $2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW
INSERT INTO app_user (id, email, password_hash, active, version, created_at, updated_at)
VALUES 
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'farmer@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'buyer@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'inspector@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'fpo@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, active = true;

-- Organization Memberships
INSERT INTO organization_membership (id, organization_id, user_id, version, created_at, updated_at)
VALUES 
  ('77777777-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000005', 0, NOW(), NOW()),
  ('77777777-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Profiles
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

-- Role Assignments
INSERT INTO user_role_assignment (id, user_id, organization_membership_id, role_code, version, created_at, updated_at)
VALUES 
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', NULL, 'ADMIN', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', '77777777-0000-0000-0000-000000000002', 'BUYER_USER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000004', NULL, 'QUALITY_INSPECTOR', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000005', '77777777-0000-0000-0000-000000000001', 'FPO_USER', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5 Commodities
INSERT INTO commodity (id, name, commodity_code, active, version, created_at, updated_at)
VALUES 
  ('99999999-0000-0000-0000-000000000001', 'Lokwan Wheat', 'WHEAT-LOK1', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000002', 'Basmati Rice', 'RICE-BAS1', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000003', 'Yellow Soybeans', 'SOY-YEL1', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000004', 'Desi Chickpeas', 'CHANA-DES1', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000005', 'Organic Cotton', 'COTTON-ORG1', true, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4 Markets
INSERT INTO market (id, name, market_code, market_type_code, state, district, location, active, version, created_at, updated_at)
VALUES 
  ('88888888-0000-0000-0000-000000000001', 'Pune APMC Mandi', 'PUNE-APMC', 'APMC_PRIMARY', 'Maharashtra', 'Pune', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000002', 'Nashik Central Mandi', 'NASHIK-APMC', 'APMC_PRIMARY', 'Maharashtra', 'Nashik', ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000003', 'Nagpur APMC Mandi', 'NAGPUR-APMC', 'APMC_PRIMARY', 'Maharashtra', 'Nagpur', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000004', 'Indore Grain Market', 'INDORE-APMC', 'APMC_PRIMARY', 'Madhya Pradesh', 'Indore', ST_SetSRID(ST_MakePoint(75.8577, 22.7196), 4326), true, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Market Prices
INSERT INTO market_price (id, commodity_id, market_id, observed_on, period_start, period_end, min_price, max_price, modal_price, currency_code, price_unit, arrival_quantity, arrival_quantity_unit, source_name, source_reference, created_at)
VALUES 
  ('66666666-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000001', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 2400.0000, 2750.0000, 2600.0000, 'INR', 'QUINTAL', 120.000, 'MT', 'AGMARKNET', 'PUNE-WHEAT-DAILY', NOW()),
  ('66666666-0000-0000-0000-000000000002', '99999999-0000-0000-0000-000000000003', '88888888-0000-0000-0000-000000000002', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 4300.0000, 4800.0000, 4600.0000, 'INR', 'QUINTAL', 85.000, 'MT', 'AGMARKNET', 'NASHIK-SOY-DAILY', NOW()),
  ('66666666-0000-0000-0000-000000000003', '99999999-0000-0000-0000-000000000004', '88888888-0000-0000-0000-000000000003', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 5100.0000, 5600.0000, 5350.0000, 'INR', 'QUINTAL', 50.000, 'MT', 'AGMARKNET', 'NAGPUR-CHANA-DAILY', NOW())
ON CONFLICT (id) DO NOTHING;

-- Supplies
INSERT INTO supply (id, commodity_id, farmer_id, organization_id, supply_kind_code, quantity, quantity_unit, available_from, version, created_at, updated_at)
VALUES 
  ('55555555-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', NULL, 'AVAILABLE_PHYSICAL', 40.000, 'MT', CURRENT_DATE - INTERVAL '5 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000002', '99999999-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', NULL, 'AVAILABLE_PHYSICAL', 25.000, 'MT', CURRENT_DATE - INTERVAL '3 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000003', '99999999-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000001', NULL, 'AVAILABLE_PHYSICAL', 35.000, 'MT', CURRENT_DATE - INTERVAL '2 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000004', '99999999-0000-0000-0000-000000000004', NULL, '11111111-0000-0000-0000-000000000001', 'AVAILABLE_PHYSICAL', 60.000, 'MT', CURRENT_DATE - INTERVAL '4 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000005', '99999999-0000-0000-0000-000000000005', 'cccccccc-0000-0000-0000-000000000001', NULL, 'AVAILABLE_PHYSICAL', 15.000, 'MT', CURRENT_DATE - INTERVAL '1 day', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5 AVAILABLE Lots
INSERT INTO lot (id, lot_number, commodity_id, source_supply_id, farmer_id, organization_id, quantity, quantity_unit, harvest_date, available_from, status_code, version, created_at, updated_at)
VALUES 
  ('44444444-0000-0000-0000-000000000001', 'LOT-WHEAT-2026-001', '99999999-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', NULL, 30.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '5 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000002', 'LOT-RICE-2026-002', '99999999-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', NULL, 20.000, 'MT', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '3 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000003', 'LOT-SOY-2026-003', '99999999-0000-0000-0000-000000000003', '55555555-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000001', NULL, 25.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000004', 'LOT-CHANA-2026-004', '99999999-0000-0000-0000-000000000004', '55555555-0000-0000-0000-000000000004', NULL, '11111111-0000-0000-0000-000000000001', 50.000, 'MT', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '4 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000005', 'LOT-COTTON-2026-005', '99999999-0000-0000-0000-000000000005', '55555555-0000-0000-0000-000000000005', 'cccccccc-0000-0000-0000-000000000001', NULL, 10.000, 'MT', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '1 day', 'AVAILABLE', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Lot Locations (Geo points in Maharashtra & MP)
INSERT INTO lot_location (id, lot_id, location, version, created_at, updated_at)
VALUES 
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 0, NOW(), NOW()),
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326), 0, NOW(), NOW()),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 0, NOW(), NOW()),
  ('33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000004', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326), 0, NOW(), NOW()),
  ('33333333-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000005', ST_SetSRID(ST_MakePoint(75.8577, 22.7196), 4326), 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Quality Tests (for Lot 1 & Lot 3)
INSERT INTO quality_test (id, lot_id, inspector_user_id, test_type_code, sampled_at, tested_at, status_code, method_code, source_code, notes, verified_at, verified_by_user_id, version, created_at, updated_at)
VALUES 
  ('22222222-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000004', 'LAB_PHYSICAL_ASSAY', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'VERIFIED', 'GRAIN_STANDARDS_IS1488', 'NABL_ACCREDITED_LAB', 'High quality Lokwan wheat with optimal moisture and high protein.', NOW() - INTERVAL '1 day', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000004', 'LAB_PHYSICAL_ASSAY', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'VERIFIED', 'AGMARK_GRADE_1', 'NABL_ACCREDITED_LAB', 'Certified grade 1 soybeans with excellent oil content.', NOW() - INTERVAL '12 hours', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Quality Measurements
INSERT INTO quality_measurement (id, quality_test_id, metric_name, numeric_value, unit, text_value, version, created_at, updated_at)
VALUES 
  ('12121212-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Moisture Content', 11.5000, '%', NULL, 0, NOW(), NOW()),
  ('12121212-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Protein Content', 12.8000, '%', NULL, 0, NOW(), NOW()),
  ('12121212-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 'Foreign Matter', 0.4000, '%', NULL, 0, NOW(), NOW()),
  ('12121212-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'Moisture Content', 9.2000, '%', NULL, 0, NOW(), NOW()),
  ('12121212-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 'Oil Content', 19.5000, '%', NULL, 0, NOW(), NOW()),
  ('12121212-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000002', 'Foreign Matter', 0.6000, '%', NULL, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2 OPEN/PUBLISHED Buyer Requirements
INSERT INTO buyer_requirement (id, buyer_profile_id, commodity_id, quantity, quantity_unit, quality_specification, delivery_location, required_by, target_price, maximum_price, currency_code, status_code, notes, version, created_at, updated_at)
VALUES 
  ('eeeeeeee-1000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 50.000, 'MT', 'Grade A Lokwan Wheat, Moisture < 12%, Protein > 12%', 'Pune Fulfillment Center, Maharashtra', CURRENT_DATE + INTERVAL '30 days', 2600.0000, 2800.0000, 'INR', 'OPEN', 'Immediate procurement for flour milling operations.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000002', 'eeeeeeee-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000003', 30.000, 'MT', 'Yellow Soybeans Grade 1, Oil Content > 18%, Moisture < 10%', 'Nashik Processing Facility, Maharashtra', CURRENT_DATE + INTERVAL '25 days', 4500.0000, 4800.0000, 'INR', 'OPEN', 'Targeting premium non-GMO soybean batch for edible oil crushing.', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
