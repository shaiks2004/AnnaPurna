-- =============================================================================
-- ANNAPURNA ENTERPRISE SEED SCRIPT (PostgreSQL 18 + PostGIS)
-- Idempotent, Human-Readable Business Identifiers & Real Mandi Market Data
-- =============================================================================

-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- -----------------------------------------------------------------------------
-- 1. ORGANIZATIONS (FPOs & Buyer Enterprises)
-- -----------------------------------------------------------------------------
INSERT INTO organization (id, name, version, created_at, updated_at)
VALUES 
  ('11111111-0000-0000-0000-000000000001', 'Maharashtra Farmer Producer Org', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000002', 'Pune Agro Procurement Ltd', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000003', 'Sahyadri Agro Producers Co', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000004', 'Godavari Valley Farmer Producer Co', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000005', 'Krishna Basin Organic FPO', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000006', 'Vidarbha Kisan Samruddhi FPC', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000007', 'MahaGrain Millers Private Ltd', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000008', 'Sahyadri Food Processors Ltd', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000009', 'Western India Edible Oils Corp', 0, NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000010', 'Deccan Cotton Exports Ltd', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- -----------------------------------------------------------------------------
-- 2. USERS (BCrypt Password for all: password123)
-- Hash: $2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW
-- -----------------------------------------------------------------------------
INSERT INTO app_user (id, email, password_hash, active, version, created_at, updated_at)
VALUES 
  -- 5 Primary Demo Personas
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'farmer@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'buyer@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'inspector@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'fpo@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  -- Additional Demo Buyers & FPOs
  ('aaaaaaaa-0000-0000-0000-000000000006', 'buyer2@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'buyer3@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000008', 'fpo2@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000009', 'fpo3@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  -- 30 Synthetic Demo Farmers (FARMER-001 .. FARMER-030)
  ('aaaaaaaa-0000-0000-0000-000000000010', 'farmer1@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000011', 'farmer2@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000012', 'farmer3@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000013', 'farmer4@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000014', 'farmer5@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000015', 'farmer6@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000016', 'farmer7@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000017', 'farmer8@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000018', 'farmer9@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000019', 'farmer10@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000020', 'farmer11@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000021', 'farmer12@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000022', 'farmer13@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000023', 'farmer14@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000024', 'farmer15@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000025', 'farmer16@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000026', 'farmer17@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000027', 'farmer18@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000028', 'farmer19@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000029', 'farmer20@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000030', 'farmer21@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000031', 'farmer22@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000032', 'farmer23@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000033', 'farmer24@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000034', 'farmer25@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000035', 'farmer26@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000036', 'farmer27@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000037', 'farmer28@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000038', 'farmer29@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW()),
  ('aaaaaaaa-0000-0000-0000-000000000039', 'farmer30@annapurna.com', '$2a$10$pi9JmpuT7rB9ZOWZ1F68Zu7d64cgNqYcV/TqWjkjD2qYUo.Sm7BlW', true, 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, active = true;

-- -----------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERSHIPS
-- -----------------------------------------------------------------------------
INSERT INTO organization_membership (id, organization_id, user_id, version, created_at, updated_at)
VALUES 
  ('77777777-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000005', 0, NOW(), NOW()), -- fpo@annapurna.com in Maharashtra FPO
  ('77777777-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003', 0, NOW(), NOW()), -- buyer@annapurna.com in Pune Agro Procurement Ltd
  ('77777777-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000006', 0, NOW(), NOW()), -- buyer2@annapurna.com in MahaGrain Millers
  ('77777777-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000007', 0, NOW(), NOW()), -- buyer3@annapurna.com in Sahyadri Food
  ('77777777-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000008', 0, NOW(), NOW()), -- fpo2@annapurna.com in Sahyadri FPO
  ('77777777-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000009', 0, NOW(), NOW())  -- fpo3@annapurna.com in Godavari FPO
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. PROFILES (Farmer, FPO, Buyer)
-- -----------------------------------------------------------------------------
-- Farmer Profiles
INSERT INTO farmer_profile (id, user_id, status_code, version, created_at, updated_at)
VALUES 
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000010', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000011', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000012', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000013', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000014', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000015', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000016', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000017', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000018', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000019', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000020', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000021', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000014', 'aaaaaaaa-0000-0000-0000-000000000022', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000015', 'aaaaaaaa-0000-0000-0000-000000000023', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000016', 'aaaaaaaa-0000-0000-0000-000000000024', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000017', 'aaaaaaaa-0000-0000-0000-000000000025', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000018', 'aaaaaaaa-0000-0000-0000-000000000026', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000019', 'aaaaaaaa-0000-0000-0000-000000000027', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000020', 'aaaaaaaa-0000-0000-0000-000000000028', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000021', 'aaaaaaaa-0000-0000-0000-000000000029', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000022', 'aaaaaaaa-0000-0000-0000-000000000030', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000023', 'aaaaaaaa-0000-0000-0000-000000000031', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000024', 'aaaaaaaa-0000-0000-0000-000000000032', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000025', 'aaaaaaaa-0000-0000-0000-000000000033', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000026', 'aaaaaaaa-0000-0000-0000-000000000034', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000027', 'aaaaaaaa-0000-0000-0000-000000000035', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000028', 'aaaaaaaa-0000-0000-0000-000000000036', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000029', 'aaaaaaaa-0000-0000-0000-000000000037', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000030', 'aaaaaaaa-0000-0000-0000-000000000038', 'ACTIVE', 0, NOW(), NOW()),
  ('cccccccc-0000-0000-0000-000000000031', 'aaaaaaaa-0000-0000-0000-000000000039', 'ACTIVE', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- FPO Profiles
INSERT INTO fpo_profile (id, organization_id, version, created_at, updated_at)
VALUES 
  ('dddddddd-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 0, NOW(), NOW()),
  ('dddddddd-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000003', 0, NOW(), NOW()),
  ('dddddddd-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  ('dddddddd-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000005', 0, NOW(), NOW()),
  ('dddddddd-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000006', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Buyer Profiles
INSERT INTO buyer_profile (id, organization_id, version, created_at, updated_at)
VALUES 
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 0, NOW(), NOW()), -- Pune Agro Procurement Ltd
  ('eeeeeeee-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000007', 0, NOW(), NOW()), -- MahaGrain Millers
  ('eeeeeeee-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000008', 0, NOW(), NOW()), -- Sahyadri Food
  ('eeeeeeee-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000009', 0, NOW(), NOW()), -- Western India Edible Oils
  ('eeeeeeee-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000010', 0, NOW(), NOW())  -- Deccan Cotton
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. USER ROLE ASSIGNMENTS
-- -----------------------------------------------------------------------------
INSERT INTO user_role_assignment (id, user_id, organization_membership_id, role_code, version, created_at, updated_at)
VALUES 
  -- Global Admin
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', NULL, 'ADMIN', 0, NOW(), NOW()),
  -- Global Farmers
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000010', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000011', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000012', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000013', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000014', 'aaaaaaaa-0000-0000-0000-000000000014', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000015', 'aaaaaaaa-0000-0000-0000-000000000015', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000016', 'aaaaaaaa-0000-0000-0000-000000000016', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000017', 'aaaaaaaa-0000-0000-0000-000000000017', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000018', 'aaaaaaaa-0000-0000-0000-000000000018', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000019', 'aaaaaaaa-0000-0000-0000-000000000019', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000020', 'aaaaaaaa-0000-0000-0000-000000000020', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000021', 'aaaaaaaa-0000-0000-0000-000000000021', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000022', 'aaaaaaaa-0000-0000-0000-000000000022', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000023', 'aaaaaaaa-0000-0000-0000-000000000023', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000024', 'aaaaaaaa-0000-0000-0000-000000000024', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000025', 'aaaaaaaa-0000-0000-0000-000000000025', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000026', 'aaaaaaaa-0000-0000-0000-000000000026', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000027', 'aaaaaaaa-0000-0000-0000-000000000027', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000028', 'aaaaaaaa-0000-0000-0000-000000000028', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000029', 'aaaaaaaa-0000-0000-0000-000000000029', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000030', 'aaaaaaaa-0000-0000-0000-000000000030', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000031', 'aaaaaaaa-0000-0000-0000-000000000031', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000032', 'aaaaaaaa-0000-0000-0000-000000000032', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000033', 'aaaaaaaa-0000-0000-0000-000000000033', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000034', 'aaaaaaaa-0000-0000-0000-000000000034', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000035', 'aaaaaaaa-0000-0000-0000-000000000035', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000036', 'aaaaaaaa-0000-0000-0000-000000000036', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000037', 'aaaaaaaa-0000-0000-0000-000000000037', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000038', 'aaaaaaaa-0000-0000-0000-000000000038', NULL, 'FARMER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000039', 'aaaaaaaa-0000-0000-0000-000000000039', NULL, 'FARMER', 0, NOW(), NOW()),
  -- Global Quality Inspector
  ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000004', NULL, 'QUALITY_INSPECTOR', 0, NOW(), NOW()),
  -- Organization-Scoped Buyers
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', '77777777-0000-0000-0000-000000000002', 'BUYER_USER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000006', '77777777-0000-0000-0000-000000000003', 'BUYER_USER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000007', '77777777-0000-0000-0000-000000000004', 'BUYER_USER', 0, NOW(), NOW()),
  -- Organization-Scoped FPOs
  ('bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000005', '77777777-0000-0000-0000-000000000001', 'FPO_USER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000008', '77777777-0000-0000-0000-000000000005', 'FPO_USER', 0, NOW(), NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000009', '77777777-0000-0000-0000-000000000006', 'FPO_USER', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. COMMODITIES (18 Official e-NAM Agricultural Commodities)
-- -----------------------------------------------------------------------------
INSERT INTO commodity (id, name, commodity_code, active, version, created_at, updated_at)
VALUES 
  ('99999999-0000-0000-0000-000000000001', 'Wheat (Lokwan / Sharbati)', 'WHEAT', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000002', 'Basmati Rice (Pusa 1121)', 'RICE-BASMATI', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000003', 'Non-Basmati Rice (Kolam)', 'RICE-NONBASMATI', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000004', 'Yellow Soybean', 'SOYBEAN', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000005', 'Desi Chickpeas (Chana)', 'CHANA', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000006', 'Pigeon Pea (Tur / Arhar)', 'TUR', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000007', 'Yellow Maize (Corn)', 'MAIZE', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000008', 'Raw Cotton (Medium Staple)', 'COTTON', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000009', 'Nasik Red Onion', 'ONION', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000010', 'Groundnut in Shell', 'GROUNDNUT', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000011', 'Mustard / Rapeseed', 'MUSTARD', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000012', 'Sorghum (Jowar Maldandi)', 'JOWAR', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000013', 'Pearl Millet (Bajra)', 'BAJRA', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000014', 'Green Gram (Moong)', 'MOONG', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000015', 'Black Gram (Urad)', 'URAD', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000016', 'Sunflower Seed', 'SUNFLOWER', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000017', 'Turmeric Finger', 'TURMERIC', true, 0, NOW(), NOW()),
  ('99999999-0000-0000-0000-000000000018', 'Coriander Seed (Dhania)', 'CORIANDER', true, 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, commodity_code = EXCLUDED.commodity_code;

-- -----------------------------------------------------------------------------
-- 7. MARKETS (25 Real Agricultural Mandis with WGS84 Coordinates)
-- -----------------------------------------------------------------------------
INSERT INTO market (id, name, market_code, market_type_code, state, district, location, active, version, created_at, updated_at)
VALUES 
  ('88888888-0000-0000-0000-000000000001', 'Pune APMC Mandi', 'MKT-PUNE', 'APMC_PRIMARY', 'Maharashtra', 'Pune', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000002', 'Nashik Central APMC', 'MKT-NASHIK', 'APMC_PRIMARY', 'Maharashtra', 'Nashik', ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000003', 'Lasalgaon Onion Market Yard', 'MKT-LASALGAON', 'APMC_SPECIALIZED', 'Maharashtra', 'Nashik', ST_SetSRID(ST_MakePoint(74.2256, 20.1478), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000004', 'Nagpur APMC Cotton & Grain Market', 'MKT-NAGPUR', 'APMC_PRIMARY', 'Maharashtra', 'Nagpur', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000005', 'Amravati APMC Cotton Yard', 'MKT-AMRAVATI', 'APMC_PRIMARY', 'Maharashtra', 'Amravati', ST_SetSRID(ST_MakePoint(77.7523, 20.9374), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000006', 'Chhatrapati Sambhajinagar APMC', 'MKT-AURANGABAD', 'APMC_PRIMARY', 'Maharashtra', 'Aurangabad', ST_SetSRID(ST_MakePoint(75.3433, 19.8762), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000007', 'Ahmednagar APMC Mandi', 'MKT-AHMEDNAGAR', 'APMC_PRIMARY', 'Maharashtra', 'Ahmednagar', ST_SetSRID(ST_MakePoint(74.7496, 19.0948), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000008', 'Solapur APMC Pulse & Oilseed Yard', 'MKT-SOLAPUR', 'APMC_PRIMARY', 'Maharashtra', 'Solapur', ST_SetSRID(ST_MakePoint(75.9064, 17.6599), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000009', 'Kolhapur Shahupuri Market Yard', 'MKT-KOLHAPUR', 'APMC_PRIMARY', 'Maharashtra', 'Kolhapur', ST_SetSRID(ST_MakePoint(74.2433, 16.7050), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000010', 'Sangli Turmeric & Spices Market', 'MKT-SANGLI', 'APMC_SPECIALIZED', 'Maharashtra', 'Sangli', ST_SetSRID(ST_MakePoint(74.5815, 16.8524), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000011', 'Satara APMC Mandi', 'MKT-SATARA', 'APMC_PRIMARY', 'Maharashtra', 'Satara', ST_SetSRID(ST_MakePoint(73.9903, 17.6805), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000012', 'Latur Pulse & Soybean Mega Market', 'MKT-LATUR', 'APMC_PRIMARY', 'Maharashtra', 'Latur', ST_SetSRID(ST_MakePoint(76.5656, 18.4088), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000013', 'Nanded APMC Mandi', 'MKT-NANDED', 'APMC_PRIMARY', 'Maharashtra', 'Nanded', ST_SetSRID(ST_MakePoint(77.3178, 19.1383), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000014', 'Jalgaon Banana & Grain Mandi', 'MKT-JALGAON', 'APMC_PRIMARY', 'Maharashtra', 'Jalgaon', ST_SetSRID(ST_MakePoint(75.5626, 21.0077), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000015', 'Akola Cotton & Pulse APMC', 'MKT-AKOLA', 'APMC_PRIMARY', 'Maharashtra', 'Akola', ST_SetSRID(ST_MakePoint(77.0082, 20.7002), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000016', 'Yavatmal APMC Mandi', 'MKT-YEOTMAL', 'APMC_PRIMARY', 'Maharashtra', 'Yavatmal', ST_SetSRID(ST_MakePoint(78.1307, 20.3888), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000017', 'Jalna Seed & Grain Market Yard', 'MKT-JALNA', 'APMC_PRIMARY', 'Maharashtra', 'Jalna', ST_SetSRID(ST_MakePoint(75.8833, 19.8410), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000018', 'Parbhani APMC Mandi', 'MKT-PARBHANI', 'APMC_PRIMARY', 'Maharashtra', 'Parbhani', ST_SetSRID(ST_MakePoint(76.7767, 19.2610), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000019', 'Dhule APMC Mandi', 'MKT-DHULE', 'APMC_PRIMARY', 'Maharashtra', 'Dhule', ST_SetSRID(ST_MakePoint(74.7749, 20.9042), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000020', 'Baramati APMC Mandi', 'MKT-BARAMATI', 'APMC_PRIMARY', 'Maharashtra', 'Pune', ST_SetSRID(ST_MakePoint(74.5775, 18.1517), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000021', 'Indore Devi Ahilya Bai Mandi', 'MKT-INDORE', 'APMC_PRIMARY', 'Madhya Pradesh', 'Indore', ST_SetSRID(ST_MakePoint(75.8577, 22.7196), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000022', 'Ujjain Chimanganj APMC', 'MKT-UJJAIN', 'APMC_PRIMARY', 'Madhya Pradesh', 'Ujjain', ST_SetSRID(ST_MakePoint(75.7873, 23.1765), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000023', 'Neemuch Grain & Herb Mandi', 'MKT-NEEMUCH', 'APMC_SPECIALIZED', 'Madhya Pradesh', 'Neemuch', ST_SetSRID(ST_MakePoint(74.8710, 24.4764), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000024', 'Belagavi APMC Market Yard', 'MKT-BELAGAVI', 'APMC_PRIMARY', 'Karnataka', 'Belagavi', ST_SetSRID(ST_MakePoint(74.4977, 15.8497), 4326), true, 0, NOW(), NOW()),
  ('88888888-0000-0000-0000-000000000025', 'Surat APMC Mandi', 'MKT-SURAT', 'APMC_PRIMARY', 'Gujarat', 'Surat', ST_SetSRID(ST_MakePoint(72.8311, 21.1702), 4326), true, 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, market_code = EXCLUDED.market_code;

-- -----------------------------------------------------------------------------
-- 8. MARKET PRICES (Agmarknet & DMI Government Benchmark Daily Observations)
-- Source: AGMARKNET / Directorate of Marketing & Inspection, Ministry of Agriculture
-- -----------------------------------------------------------------------------
INSERT INTO market_price (id, commodity_id, market_id, observed_on, period_start, period_end, min_price, max_price, modal_price, currency_code, price_unit, arrival_quantity, arrival_quantity_unit, source_name, source_reference, created_at)
VALUES 
  -- Wheat Observations (Pune, Nashik, Nagpur, Indore)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM market WHERE market_code = 'MKT-PUNE'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 2450.0000, 2800.0000, 2650.0000, 'INR', 'QUINTAL', 145.500, 'MT', 'AGMARKNET', 'PUNE-WHEAT-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM market WHERE market_code = 'MKT-NASHIK'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 2400.0000, 2720.0000, 2580.0000, 'INR', 'QUINTAL', 210.000, 'MT', 'AGMARKNET', 'NASHIK-WHEAT-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM market WHERE market_code = 'MKT-NAGPUR'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 2380.0000, 2690.0000, 2540.0000, 'INR', 'QUINTAL', 95.000, 'MT', 'AGMARKNET', 'NAGPUR-WHEAT-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM market WHERE market_code = 'MKT-INDORE'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 2420.0000, 2750.0000, 2600.0000, 'INR', 'QUINTAL', 320.000, 'MT', 'AGMARKNET', 'INDORE-WHEAT-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM market WHERE market_code = 'MKT-PUNE'), CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 2440.0000, 2780.0000, 2640.0000, 'INR', 'QUINTAL', 130.000, 'MT', 'AGMARKNET', 'PUNE-WHEAT-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM market WHERE market_code = 'MKT-NASHIK'), CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 2390.0000, 2700.0000, 2560.0000, 'INR', 'QUINTAL', 190.000, 'MT', 'AGMARKNET', 'NASHIK-WHEAT-2026', NOW()),
  -- Soybean Observations (Latur, Nashik, Akola, Indore)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM market WHERE market_code = 'MKT-LATUR'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 4400.0000, 4850.0000, 4680.0000, 'INR', 'QUINTAL', 450.000, 'MT', 'AGMARKNET', 'LATUR-SOY-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM market WHERE market_code = 'MKT-NASHIK'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 4350.0000, 4780.0000, 4620.0000, 'INR', 'QUINTAL', 180.000, 'MT', 'AGMARKNET', 'NASHIK-SOY-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM market WHERE market_code = 'MKT-AKOLA'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 4380.0000, 4820.0000, 4650.0000, 'INR', 'QUINTAL', 290.000, 'MT', 'AGMARKNET', 'AKOLA-SOY-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM market WHERE market_code = 'MKT-INDORE'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 4450.0000, 4900.0000, 4720.0000, 'INR', 'QUINTAL', 520.000, 'MT', 'AGMARKNET', 'INDORE-SOY-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM market WHERE market_code = 'MKT-LATUR'), CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 4380.0000, 4810.0000, 4640.0000, 'INR', 'QUINTAL', 410.000, 'MT', 'AGMARKNET', 'LATUR-SOY-2026', NOW()),
  -- Chana / Chickpea Observations (Nagpur, Ahmednagar, Latur, Solapur)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), (SELECT id FROM market WHERE market_code = 'MKT-NAGPUR'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 5150.0000, 5650.0000, 5420.0000, 'INR', 'QUINTAL', 120.000, 'MT', 'AGMARKNET', 'NAGPUR-CHANA-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), (SELECT id FROM market WHERE market_code = 'MKT-AHMEDNAGAR'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 5100.0000, 5580.0000, 5380.0000, 'INR', 'QUINTAL', 85.000, 'MT', 'AGMARKNET', 'AHMEDNAGAR-CHANA-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), (SELECT id FROM market WHERE market_code = 'MKT-LATUR'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 5200.0000, 5700.0000, 5490.0000, 'INR', 'QUINTAL', 210.000, 'MT', 'AGMARKNET', 'LATUR-CHANA-2026', NOW()),
  -- Rice (Basmati & Kolam)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'RICE-BASMATI'), (SELECT id FROM market WHERE market_code = 'MKT-PUNE'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 6800.0000, 8200.0000, 7600.0000, 'INR', 'QUINTAL', 60.000, 'MT', 'AGMARKNET', 'PUNE-BASMATI-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'RICE-NONBASMATI'), (SELECT id FROM market WHERE market_code = 'MKT-NAGPUR'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 3200.0000, 3750.0000, 3500.0000, 'INR', 'QUINTAL', 180.000, 'MT', 'AGMARKNET', 'NAGPUR-KOLAM-2026', NOW()),
  -- Cotton (Amravati, Akola, Yavatmal)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'COTTON'), (SELECT id FROM market WHERE market_code = 'MKT-AMRAVATI'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 6700.0000, 7350.0000, 7050.0000, 'INR', 'QUINTAL', 340.000, 'MT', 'AGMARKNET', 'AMRAVATI-COTTON-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'COTTON'), (SELECT id FROM market WHERE market_code = 'MKT-AKOLA'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 6650.0000, 7280.0000, 6980.0000, 'INR', 'QUINTAL', 280.000, 'MT', 'AGMARKNET', 'AKOLA-COTTON-2026', NOW()),
  -- Onion (Lasalgaon, Nashik, Pune)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'ONION'), (SELECT id FROM market WHERE market_code = 'MKT-LASALGAON'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 1450.0000, 2250.0000, 1850.0000, 'INR', 'QUINTAL', 850.000, 'MT', 'AGMARKNET', 'LASALGAON-ONION-2026', NOW()),
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'ONION'), (SELECT id FROM market WHERE market_code = 'MKT-NASHIK'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 1400.0000, 2180.0000, 1800.0000, 'INR', 'QUINTAL', 620.000, 'MT', 'AGMARKNET', 'NASHIK-ONION-2026', NOW()),
  -- Tur / Arhar (Latur, Solapur)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'TUR'), (SELECT id FROM market WHERE market_code = 'MKT-LATUR'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 8800.0000, 9650.0000, 9250.0000, 'INR', 'QUINTAL', 160.000, 'MT', 'AGMARKNET', 'LATUR-TUR-2026', NOW()),
  -- Maize (Nashik, Jalgaon)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'MAIZE'), (SELECT id FROM market WHERE market_code = 'MKT-NASHIK'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 1950.0000, 2350.0000, 2180.0000, 'INR', 'QUINTAL', 240.000, 'MT', 'AGMARKNET', 'NASHIK-MAIZE-2026', NOW()),
  -- Turmeric (Sangli)
  (gen_random_uuid(), (SELECT id FROM commodity WHERE commodity_code = 'TURMERIC'), (SELECT id FROM market WHERE market_code = 'MKT-SANGLI'), CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, 12500.0000, 15800.0000, 14200.0000, 'INR', 'QUINTAL', 95.000, 'MT', 'AGMARKNET', 'SANGLI-TURMERIC-2026', NOW())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. SYNTHETIC SUPPLIES (Declared Supplies from Farmers and FPOs)
-- -----------------------------------------------------------------------------
INSERT INTO supply (id, commodity_id, farmer_id, organization_id, supply_kind_code, quantity, quantity_unit, expected_harvest_date, available_from, version, created_at, updated_at)
VALUES 
  -- Farmer Supplies (Wheat)
  ('55555555-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000002'), NULL, 'AVAILABLE_PHYSICAL', 45.000, 'MT', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000002', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000010'), NULL, 'AVAILABLE_PHYSICAL', 30.000, 'MT', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '4 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000003', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000011'), NULL, 'AVAILABLE_PHYSICAL', 60.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '3 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000004', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000012'), NULL, 'AVAILABLE_PHYSICAL', 25.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '2 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000005', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000013'), NULL, 'AVAILABLE_PHYSICAL', 50.000, 'MT', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '1 day', 0, NOW(), NOW()),
  -- FPO Supplies (Wheat)
  ('55555555-0000-0000-0000-000000000006', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), NULL, '11111111-0000-0000-0000-000000000001', 'AVAILABLE_PHYSICAL', 120.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '3 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000007', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), NULL, '11111111-0000-0000-0000-000000000003', 'AVAILABLE_PHYSICAL', 85.000, 'MT', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '2 days', 0, NOW(), NOW()),
  -- Farmer Supplies (Soybean)
  ('55555555-0000-0000-0000-000000000008', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000014'), NULL, 'AVAILABLE_PHYSICAL', 35.000, 'MT', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '6 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000009', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000015'), NULL, 'AVAILABLE_PHYSICAL', 40.000, 'MT', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE - INTERVAL '5 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000010', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000016'), NULL, 'AVAILABLE_PHYSICAL', 28.000, 'MT', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '4 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000011', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000017'), NULL, 'AVAILABLE_PHYSICAL', 55.000, 'MT', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '3 days', 0, NOW(), NOW()),
  -- FPO Supplies (Soybean)
  ('55555555-0000-0000-0000-000000000012', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), NULL, '11111111-0000-0000-0000-000000000004', 'AVAILABLE_PHYSICAL', 90.000, 'MT', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE - INTERVAL '3 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000013', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), NULL, '11111111-0000-0000-0000-000000000006', 'AVAILABLE_PHYSICAL', 110.000, 'MT', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '2 days', 0, NOW(), NOW()),
  -- Chana Supplies
  ('55555555-0000-0000-0000-000000000014', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000018'), NULL, 'AVAILABLE_PHYSICAL', 30.000, 'MT', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000015', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000019'), NULL, 'AVAILABLE_PHYSICAL', 22.000, 'MT', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '4 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000016', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), NULL, '11111111-0000-0000-0000-000000000005', 'AVAILABLE_PHYSICAL', 75.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '3 days', 0, NOW(), NOW()),
  -- Basmati Rice Supplies
  ('55555555-0000-0000-0000-000000000017', (SELECT id FROM commodity WHERE commodity_code = 'RICE-BASMATI'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000020'), NULL, 'AVAILABLE_PHYSICAL', 25.000, 'MT', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE - INTERVAL '4 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000018', (SELECT id FROM commodity WHERE commodity_code = 'RICE-BASMATI'), NULL, '11111111-0000-0000-0000-000000000001', 'AVAILABLE_PHYSICAL', 65.000, 'MT', CURRENT_DATE - INTERVAL '19 days', CURRENT_DATE - INTERVAL '3 days', 0, NOW(), NOW()),
  -- Cotton Supplies
  ('55555555-0000-0000-0000-000000000019', (SELECT id FROM commodity WHERE commodity_code = 'COTTON'), (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000021'), NULL, 'AVAILABLE_PHYSICAL', 18.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '2 days', 0, NOW(), NOW()),
  ('55555555-0000-0000-0000-000000000020', (SELECT id FROM commodity WHERE commodity_code = 'COTTON'), NULL, '11111111-0000-0000-0000-000000000006', 'AVAILABLE_PHYSICAL', 45.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '2 days', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 10. PHYSICAL LOTS (Human-Readable Business Codes: LOT-WHEAT-001, etc.)
-- -----------------------------------------------------------------------------
INSERT INTO lot (id, lot_number, commodity_id, source_supply_id, farmer_id, organization_id, quantity, quantity_unit, harvest_date, available_from, status_code, version, created_at, updated_at)
VALUES 
  -- Wheat Physical Lots (Candidate pool for Wheat Requirements)
  ('44444444-0000-0000-0000-000000000001', 'LOT-WHEAT-001', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), '55555555-0000-0000-0000-000000000001', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000002'), NULL, 45.000, 'MT', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000002', 'LOT-WHEAT-002', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), '55555555-0000-0000-0000-000000000002', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000010'), NULL, 30.000, 'MT', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '4 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000003', 'LOT-WHEAT-003', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), '55555555-0000-0000-0000-000000000003', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000011'), NULL, 60.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '3 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000004', 'LOT-WHEAT-004', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), '55555555-0000-0000-0000-000000000004', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000012'), NULL, 25.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000005', 'LOT-WHEAT-005', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), '55555555-0000-0000-0000-000000000005', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000013'), NULL, 50.000, 'MT', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '1 day', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000006', 'LOT-WHEAT-006', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), '55555555-0000-0000-0000-000000000006', NULL, '11111111-0000-0000-0000-000000000001', 120.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '3 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000007', 'LOT-WHEAT-007', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), '55555555-0000-0000-0000-000000000007', NULL, '11111111-0000-0000-0000-000000000003', 85.000, 'MT', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000008', 'LOT-WHEAT-008', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000022'), NULL, 35.000, 'MT', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '1 day', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000009', 'LOT-WHEAT-009', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000023'), NULL, 40.000, 'MT', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE, 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000010', 'LOT-WHEAT-010', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000024'), NULL, 55.000, 'MT', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, 'VERIFIED', 0, NOW(), NOW()),
  -- Soybean Physical Lots
  ('44444444-0000-0000-0000-000000000011', 'LOT-SOY-001', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), '55555555-0000-0000-0000-000000000008', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000014'), NULL, 35.000, 'MT', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '6 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000012', 'LOT-SOY-002', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), '55555555-0000-0000-0000-000000000009', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000015'), NULL, 40.000, 'MT', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE - INTERVAL '5 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000013', 'LOT-SOY-003', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), '55555555-0000-0000-0000-000000000010', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000016'), NULL, 28.000, 'MT', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '4 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000014', 'LOT-SOY-004', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), '55555555-0000-0000-0000-000000000011', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000017'), NULL, 55.000, 'MT', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '3 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000015', 'LOT-SOY-005', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), '55555555-0000-0000-0000-000000000012', NULL, '11111111-0000-0000-0000-000000000004', 90.000, 'MT', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE - INTERVAL '3 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000016', 'LOT-SOY-006', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), '55555555-0000-0000-0000-000000000013', NULL, '11111111-0000-0000-0000-000000000006', 110.000, 'MT', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000017', 'LOT-SOY-007', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000025'), NULL, 32.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '1 day', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000018', 'LOT-SOY-008', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000026'), NULL, 48.000, 'MT', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE, 'AVAILABLE', 0, NOW(), NOW()),
  -- Chana Physical Lots
  ('44444444-0000-0000-0000-000000000019', 'LOT-CHANA-001', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), '55555555-0000-0000-0000-000000000014', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000018'), NULL, 30.000, 'MT', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000020', 'LOT-CHANA-002', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), '55555555-0000-0000-0000-000000000015', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000019'), NULL, 22.000, 'MT', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '4 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000021', 'LOT-CHANA-003', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), '55555555-0000-0000-0000-000000000016', NULL, '11111111-0000-0000-0000-000000000005', 75.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '3 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000022', 'LOT-CHANA-004', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000027'), NULL, 40.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000023', 'LOT-CHANA-005', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000028'), NULL, 35.000, 'MT', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '1 day', 'AVAILABLE', 0, NOW(), NOW()),
  -- Basmati Rice Lots
  ('44444444-0000-0000-0000-000000000024', 'LOT-RICE-001', (SELECT id FROM commodity WHERE commodity_code = 'RICE-BASMATI'), '55555555-0000-0000-0000-000000000017', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000020'), NULL, 25.000, 'MT', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE - INTERVAL '4 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000025', 'LOT-RICE-002', (SELECT id FROM commodity WHERE commodity_code = 'RICE-BASMATI'), '55555555-0000-0000-0000-000000000018', NULL, '11111111-0000-0000-0000-000000000001', 65.000, 'MT', CURRENT_DATE - INTERVAL '19 days', CURRENT_DATE - INTERVAL '3 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000026', 'LOT-RICE-003', (SELECT id FROM commodity WHERE commodity_code = 'RICE-BASMATI'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000029'), NULL, 30.000, 'MT', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW()),
  -- Cotton Lots
  ('44444444-0000-0000-0000-000000000027', 'LOT-COTTON-001', (SELECT id FROM commodity WHERE commodity_code = 'COTTON'), '55555555-0000-0000-0000-000000000019', (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000021'), NULL, 18.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000028', 'LOT-COTTON-002', (SELECT id FROM commodity WHERE commodity_code = 'COTTON'), '55555555-0000-0000-0000-000000000020', NULL, '11111111-0000-0000-0000-000000000006', 45.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000029', 'LOT-COTTON-003', (SELECT id FROM commodity WHERE commodity_code = 'COTTON'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000030'), NULL, 22.000, 'MT', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '1 day', 'AVAILABLE', 0, NOW(), NOW()),
  -- Maize Lots
  ('44444444-0000-0000-0000-000000000030', 'LOT-MAIZE-001', (SELECT id FROM commodity WHERE commodity_code = 'MAIZE'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000031'), NULL, 50.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '1 day', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000031', 'LOT-MAIZE-002', (SELECT id FROM commodity WHERE commodity_code = 'MAIZE'), NULL, NULL, '11111111-0000-0000-0000-000000000003', 80.000, 'MT', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE, 'AVAILABLE', 0, NOW(), NOW()),
  -- Tur / Arhar Lots
  ('44444444-0000-0000-0000-000000000032', 'LOT-TUR-001', (SELECT id FROM commodity WHERE commodity_code = 'TUR'), NULL, (SELECT id FROM farmer_profile WHERE user_id = 'aaaaaaaa-0000-0000-0000-000000000002'), NULL, 20.000, 'MT', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '3 days', 'AVAILABLE', 0, NOW(), NOW()),
  ('44444444-0000-0000-0000-000000000033', 'LOT-TUR-002', (SELECT id FROM commodity WHERE commodity_code = 'TUR'), NULL, NULL, '11111111-0000-0000-0000-000000000004', 40.000, 'MT', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '2 days', 'AVAILABLE', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET lot_number = EXCLUDED.lot_number, status_code = EXCLUDED.status_code, quantity = EXCLUDED.quantity;

-- -----------------------------------------------------------------------------
-- 11. LOT LOCATIONS (WGS84 GeoPoints in Maharashtra farming belts)
-- -----------------------------------------------------------------------------
INSERT INTO lot_location (id, lot_id, location, version, created_at, updated_at)
VALUES 
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 0, NOW(), NOW()), -- Pune
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326), 0, NOW(), NOW()), -- Nashik
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', ST_SetSRID(ST_MakePoint(74.7496, 19.0948), 4326), 0, NOW(), NOW()), -- Ahmednagar
  ('33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000004', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 0, NOW(), NOW()), -- Pune
  ('33333333-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000005', ST_SetSRID(ST_MakePoint(74.5775, 18.1517), 4326), 0, NOW(), NOW()), -- Baramati
  ('33333333-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000006', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 0, NOW(), NOW()), -- Pune
  ('33333333-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000007', ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326), 0, NOW(), NOW()), -- Nashik
  ('33333333-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000008', ST_SetSRID(ST_MakePoint(75.3433, 19.8762), 4326), 0, NOW(), NOW()), -- Chh. Sambhajinagar
  ('33333333-0000-0000-0000-000000000009', '44444444-0000-0000-0000-000000000009', ST_SetSRID(ST_MakePoint(74.7749, 20.9042), 4326), 0, NOW(), NOW()), -- Dhule
  ('33333333-0000-0000-0000-000000000010', '44444444-0000-0000-0000-000000000010', ST_SetSRID(ST_MakePoint(75.5626, 21.0077), 4326), 0, NOW(), NOW()), -- Jalgaon
  ('33333333-0000-0000-0000-000000000011', '44444444-0000-0000-0000-000000000011', ST_SetSRID(ST_MakePoint(76.5656, 18.4088), 4326), 0, NOW(), NOW()), -- Latur
  ('33333333-0000-0000-0000-000000000012', '44444444-0000-0000-0000-000000000012', ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326), 0, NOW(), NOW()), -- Nashik
  ('33333333-0000-0000-0000-000000000013', '44444444-0000-0000-0000-000000000013', ST_SetSRID(ST_MakePoint(77.0082, 20.7002), 4326), 0, NOW(), NOW()), -- Akola
  ('33333333-0000-0000-0000-000000000014', '44444444-0000-0000-0000-000000000014', ST_SetSRID(ST_MakePoint(76.5656, 18.4088), 4326), 0, NOW(), NOW()), -- Latur
  ('33333333-0000-0000-0000-000000000015', '44444444-0000-0000-0000-000000000015', ST_SetSRID(ST_MakePoint(75.8833, 19.8410), 4326), 0, NOW(), NOW()), -- Jalna
  ('33333333-0000-0000-0000-000000000016', '44444444-0000-0000-0000-000000000016', ST_SetSRID(ST_MakePoint(77.7523, 20.9374), 4326), 0, NOW(), NOW()), -- Amravati
  ('33333333-0000-0000-0000-000000000017', '44444444-0000-0000-0000-000000000017', ST_SetSRID(ST_MakePoint(76.7767, 19.2610), 4326), 0, NOW(), NOW()), -- Parbhani
  ('33333333-0000-0000-0000-000000000018', '44444444-0000-0000-0000-000000000018', ST_SetSRID(ST_MakePoint(77.3178, 19.1383), 4326), 0, NOW(), NOW()), -- Nanded
  ('33333333-0000-0000-0000-000000000019', '44444444-0000-0000-0000-000000000019', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326), 0, NOW(), NOW()), -- Nagpur
  ('33333333-0000-0000-0000-000000000020', '44444444-0000-0000-0000-000000000020', ST_SetSRID(ST_MakePoint(74.7496, 19.0948), 4326), 0, NOW(), NOW()), -- Ahmednagar
  ('33333333-0000-0000-0000-000000000021', '44444444-0000-0000-0000-000000000021', ST_SetSRID(ST_MakePoint(75.9064, 17.6599), 4326), 0, NOW(), NOW()), -- Solapur
  ('33333333-0000-0000-0000-000000000022', '44444444-0000-0000-0000-000000000022', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326), 0, NOW(), NOW()), -- Nagpur
  ('33333333-0000-0000-0000-000000000023', '44444444-0000-0000-0000-000000000023', ST_SetSRID(ST_MakePoint(78.1307, 20.3888), 4326), 0, NOW(), NOW()), -- Yavatmal
  ('33333333-0000-0000-0000-000000000024', '44444444-0000-0000-0000-000000000024', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 0, NOW(), NOW()), -- Pune
  ('33333333-0000-0000-0000-000000000025', '44444444-0000-0000-0000-000000000025', ST_SetSRID(ST_MakePoint(74.2433, 16.7050), 4326), 0, NOW(), NOW()), -- Kolhapur
  ('33333333-0000-0000-0000-000000000026', '44444444-0000-0000-0000-000000000026', ST_SetSRID(ST_MakePoint(73.9903, 17.6805), 4326), 0, NOW(), NOW()), -- Satara
  ('33333333-0000-0000-0000-000000000027', '44444444-0000-0000-0000-000000000027', ST_SetSRID(ST_MakePoint(77.7523, 20.9374), 4326), 0, NOW(), NOW()), -- Amravati
  ('33333333-0000-0000-0000-000000000028', '44444444-0000-0000-0000-000000000028', ST_SetSRID(ST_MakePoint(77.0082, 20.7002), 4326), 0, NOW(), NOW()), -- Akola
  ('33333333-0000-0000-0000-000000000029', '44444444-0000-0000-0000-000000000029', ST_SetSRID(ST_MakePoint(78.1307, 20.3888), 4326), 0, NOW(), NOW()), -- Yavatmal
  ('33333333-0000-0000-0000-000000000030', '44444444-0000-0000-0000-000000000030', ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326), 0, NOW(), NOW()), -- Nashik
  ('33333333-0000-0000-0000-000000000031', '44444444-0000-0000-0000-000000000031', ST_SetSRID(ST_MakePoint(75.5626, 21.0077), 4326), 0, NOW(), NOW()), -- Jalgaon
  ('33333333-0000-0000-0000-000000000032', '44444444-0000-0000-0000-000000000032', ST_SetSRID(ST_MakePoint(76.5656, 18.4088), 4326), 0, NOW(), NOW()), -- Latur
  ('33333333-0000-0000-0000-000000000033', '44444444-0000-0000-0000-000000000033', ST_SetSRID(ST_MakePoint(75.9064, 17.6599), 4326), 0, NOW(), NOW())  -- Solapur
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 12. QUALITY TESTS & MEASUREMENTS (Realistic Quality Assays)
-- -----------------------------------------------------------------------------
INSERT INTO quality_test (id, lot_id, inspector_user_id, test_type_code, sampled_at, tested_at, status_code, method_code, source_code, notes, verified_at, verified_by_user_id, version, created_at, updated_at)
VALUES 
  -- Verified Assays on Wheat Lots
  ('22222222-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000004', 'LAB_PHYSICAL_ASSAY', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'VERIFIED', 'GRAIN_IS_1488', 'REGIONAL_AGRI_LAB', 'Grade A Lokwan wheat with optimal moisture and high natural protein content.', NOW() - INTERVAL '1 day', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000004', 'LAB_PHYSICAL_ASSAY', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'VERIFIED', 'GRAIN_IS_1488', 'REGIONAL_AGRI_LAB', 'Clean Sharbati wheat batch compliant with food safety parameters.', NOW() - INTERVAL '1 day', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000004', 'LAB_PHYSICAL_ASSAY', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'VERIFIED', 'GRAIN_IS_1488', 'NABL_TEST_FACILITY', 'FPO aggregated prime Lokwan wheat certified ready for direct milling.', NOW() - INTERVAL '12 hours', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  -- Verified Assays on Soybean Lots
  ('22222222-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000004', 'OILSEED_ASSAY', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'VERIFIED', 'AGMARK_GRADE_1', 'REGIONAL_AGRI_LAB', 'Certified Grade 1 yellow soybeans with superior oil yield potential.', NOW() - INTERVAL '2 days', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000015', 'aaaaaaaa-0000-0000-0000-000000000004', 'OILSEED_ASSAY', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'VERIFIED', 'AGMARK_GRADE_1', 'NABL_TEST_FACILITY', 'High density non-GMO soybean batch with low foreign matter.', NOW() - INTERVAL '12 hours', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  -- Verified Assays on Chana Lots
  ('22222222-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000019', 'aaaaaaaa-0000-0000-0000-000000000004', 'PULSE_ASSAY', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'VERIFIED', 'PULSE_STANDARDS_IS', 'REGIONAL_AGRI_LAB', 'Bold grain Desi chickpea with excellent milling yield and low weeviled count.', NOW() - INTERVAL '1 day', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  -- Verified Assays on Rice & Cotton
  ('22222222-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000024', 'aaaaaaaa-0000-0000-0000-000000000004', 'GRAIN_PHYSICAL', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'VERIFIED', 'EXPORT_RICE_STD', 'NABL_TEST_FACILITY', 'Extra long slender grain Pusa 1121 with distinctive aroma.', NOW() - INTERVAL '1 day', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW()),
  ('22222222-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000027', 'aaaaaaaa-0000-0000-0000-000000000004', 'FIBRE_ASSAY', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'VERIFIED', 'COTTON_FIBRE_STD', 'TEXTILE_BOARD_LAB', 'Medium staple 28mm clean raw cotton with high micronaire strength.', NOW() - INTERVAL '12 hours', 'aaaaaaaa-0000-0000-0000-000000000004', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Quality Measurements
INSERT INTO quality_measurement (id, quality_test_id, metric_name, numeric_value, unit, text_value, version, created_at, updated_at)
VALUES 
  -- Test 1 (Lot 1 Wheat)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Moisture Content', 11.2000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Protein Content', 12.6000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Foreign Matter', 0.4000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Test Weight (Hectolitre)', 78.5000, 'kg/hL', NULL, 0, NOW(), NOW()),
  -- Test 2 (Lot 2 Wheat)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'Moisture Content', 11.5000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'Protein Content', 12.1000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'Foreign Matter', 0.6000, '%', NULL, 0, NOW(), NOW()),
  -- Test 3 (Lot 6 Wheat FPO)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'Moisture Content', 10.8000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'Protein Content', 13.0000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'Foreign Matter', 0.3000, '%', NULL, 0, NOW(), NOW()),
  -- Test 4 (Lot 11 Soybean)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'Moisture Content', 9.4000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'Oil Content', 19.8000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'Foreign Matter', 0.5000, '%', NULL, 0, NOW(), NOW()),
  -- Test 5 (Lot 15 Soybean FPO)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 'Moisture Content', 9.1000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 'Oil Content', 20.2000, '%', NULL, 0, NOW(), NOW()),
  -- Test 6 (Lot 19 Chana)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 'Moisture Content', 9.8000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 'Damaged Grains', 1.2000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 'Foreign Matter', 0.4000, '%', NULL, 0, NOW(), NOW()),
  -- Test 7 (Lot 24 Rice)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 'Moisture Content', 11.0000, '%', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 'Grain Length', 8.2000, 'mm', NULL, 0, NOW(), NOW()),
  -- Test 8 (Lot 27 Cotton)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000008', 'Staple Length', 28.5000, 'mm', NULL, 0, NOW(), NOW()),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000008', 'Micronaire', 4.1000, 'ug/inch', NULL, 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 13. BUYER PROCUREMENT REQUIREMENTS (15 Requirements across Personas)
-- -----------------------------------------------------------------------------
INSERT INTO buyer_requirement (id, buyer_profile_id, commodity_id, quantity, quantity_unit, quality_specification, delivery_location, required_by, target_price, maximum_price, currency_code, status_code, notes, version, created_at, updated_at)
VALUES 
  -- Buyer 1: Pune Agro Procurement Ltd (buyer@annapurna.com)
  ('eeeeeeee-1000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), 50.000, 'MT', 'Grade A Lokwan / Sharbati Wheat; Moisture <= 12%; Protein >= 12%; Foreign matter max 0.5%', 'Central Fulfillment Hub, Sector 4, APMC Yard, Pune', CURRENT_DATE + INTERVAL '25 days', 2600.0000, 2800.0000, 'INR', 'OPEN', 'Immediate procurement for flour milling operations with prompt gate delivery.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000002', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), 35.000, 'MT', 'Certified Yellow Soybeans Grade 1; Oil content >= 19%; Moisture <= 10%', 'Processing Plant Bay 2, MIDC Industrial Area, Nashik', CURRENT_DATE + INTERVAL '20 days', 4500.0000, 4800.0000, 'INR', 'OPEN', 'Premium non-GMO batch required for solvent extraction and edible oil processing.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000003', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), 30.000, 'MT', 'Desi Bengal Gram (Chana); Moisture <= 10%; Damaged grains max 1.5%', 'Nagpur Wholesale Terminal, APMC Yard, Maharashtra', CURRENT_DATE + INTERVAL '30 days', 5200.0000, 5500.0000, 'INR', 'OPEN', 'Targeting dry pulse batch for retail pack packaging.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000004', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'RICE-BASMATI'), 25.000, 'MT', 'Aged Pusa 1121 Basmati Rice; Moisture <= 12%; Average grain length >= 8.2mm', 'JNPT Export Consolidation Bay, Navi Mumbai', CURRENT_DATE + INTERVAL '35 days', 7200.0000, 7800.0000, 'INR', 'OPEN', 'Export consignment lot matching strict international phytosanitary standards.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000005', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'COTTON'), 20.000, 'MT', 'Clean Raw Cotton Medium Staple 28mm+; Trash content <= 3%; Moisture <= 8%', 'Amravati Textile Spinning Mill, Sector B, Maharashtra', CURRENT_DATE + INTERVAL '15 days', 6800.0000, 7200.0000, 'INR', 'OPEN', 'Standard textile quality cotton lot for carded yarn production.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000006', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'MAIZE'), 40.000, 'MT', 'Yellow Feed Maize; Moisture <= 13%; Aflatoxin <= 20 ppb', 'Nashik Animal & Poultry Feed Terminal, Maharashtra', CURRENT_DATE + INTERVAL '18 days', 2100.0000, 2300.0000, 'INR', 'OPEN', 'Bulk requirement for poultry mash manufacturing.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000007', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), 75.000, 'MT', 'Lokwan / Durum Wheat; Moisture <= 11.5%; Protein >= 12.5%', 'Pune Agro Terminal, Hadapsar, Maharashtra', CURRENT_DATE + INTERVAL '40 days', 2550.0000, 2750.0000, 'INR', 'PUBLISHED', 'Advance procurement tender for Q3 inventory buffer.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000008', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'TUR'), 15.000, 'MT', 'Clean Pigeon Pea (Tur / Arhar); Moisture <= 10%; Foreign matter <= 1%', 'Latur Mega Pulse Mill Complex, Maharashtra', CURRENT_DATE + INTERVAL '22 days', 8900.0000, 9400.0000, 'INR', 'OPEN', 'Dal milling operational intent with immediate electronic weighbridge acceptance.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000009', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'ONION'), 20.000, 'MT', 'Nasik Red Onion Grade A; Size 45-55mm; Dry outer skin; No sprouts', 'Pune APMC Cold Storage Terminal, Maharashtra', CURRENT_DATE + INTERVAL '12 days', 1800.0000, 2100.0000, 'INR', 'OPEN', 'High quality onion batch for domestic retail distribution chain.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000010', 'eeeeeeee-0000-0000-0000-000000000001', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), 20.000, 'MT', 'Standard Lokwan Wheat; Draft specification', 'Pune APMC Yard, Maharashtra', CURRENT_DATE + INTERVAL '14 days', 2500.0000, 2700.0000, 'INR', 'DRAFT', 'Draft stage requirement being prepared for procurement committee sign-off.', 0, NOW(), NOW()),
  -- Buyer 2: MahaGrain Millers Private Ltd (buyer2@annapurna.com)
  ('eeeeeeee-1000-0000-0000-000000000011', 'eeeeeeee-0000-0000-0000-000000000002', (SELECT id FROM commodity WHERE commodity_code = 'WHEAT'), 100.000, 'MT', 'Bulk Milling Wheat Grade 1; Moisture <= 12%; Protein >= 11.8%', 'MahaGrain Central Silos, Nashik-Pune Highway, Maharashtra', CURRENT_DATE + INTERVAL '28 days', 2580.0000, 2750.0000, 'INR', 'OPEN', 'Commercial grain milling run batch.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000012', 'eeeeeeee-0000-0000-0000-000000000002', (SELECT id FROM commodity WHERE commodity_code = 'CHANA'), 50.000, 'MT', 'Desi Chana; Moisture <= 10%; High germination index', 'MahaGrain Dal Processing Bay, Ahmednagar, Maharashtra', CURRENT_DATE + INTERVAL '25 days', 5150.0000, 5450.0000, 'INR', 'OPEN', 'Large scale chickpea splitting and besan processing.', 0, NOW(), NOW()),
  -- Buyer 3: Sahyadri Food Processors Ltd (buyer3@annapurna.com)
  ('eeeeeeee-1000-0000-0000-000000000013', 'eeeeeeee-0000-0000-0000-000000000003', (SELECT id FROM commodity WHERE commodity_code = 'SOYBEAN'), 60.000, 'MT', 'Clean Soybeans Grade 1; High protein meal potential', 'Sahyadri Extraction Plant, Latur Industrial Area, Maharashtra', CURRENT_DATE + INTERVAL '21 days', 4480.0000, 4750.0000, 'INR', 'OPEN', 'Soy protein isolate extraction.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000014', 'eeeeeeee-0000-0000-0000-000000000003', (SELECT id FROM commodity WHERE commodity_code = 'MAIZE'), 50.000, 'MT', 'Starch Grade Maize; Moisture <= 14%', 'Sahyadri Starch & Glucose Unit, Jalgaon, Maharashtra', CURRENT_DATE + INTERVAL '24 days', 2050.0000, 2250.0000, 'INR', 'OPEN', 'Corn starch and liquid glucose production batch.', 0, NOW(), NOW()),
  ('eeeeeeee-1000-0000-0000-000000000015', 'eeeeeeee-0000-0000-0000-000000000003', (SELECT id FROM commodity WHERE commodity_code = 'TURMERIC'), 10.000, 'MT', 'Turmeric Salem / Rajapuri; Curcumin >= 3.5%; Moisture <= 10%', 'Sahyadri Spices Processing Plant, Sangli, Maharashtra', CURRENT_DATE + INTERVAL '30 days', 13500.0000, 14800.0000, 'INR', 'OPEN', 'High-curcumin spice grinding and Oleoresin extraction.', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, status_code = EXCLUDED.status_code, target_price = EXCLUDED.target_price, maximum_price = EXCLUDED.maximum_price;
