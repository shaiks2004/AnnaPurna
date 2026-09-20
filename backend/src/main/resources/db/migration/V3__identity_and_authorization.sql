ALTER TABLE app_user
    ADD COLUMN email VARCHAR(320),
    ADD COLUMN password_hash VARCHAR(255),
    ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX uq_app_user_email_normalized ON app_user (LOWER(email)) WHERE email IS NOT NULL;

CREATE TABLE user_role_assignment (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_user(id),
    organization_membership_id UUID REFERENCES organization_membership(id),
    role_code VARCHAR(64) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_user_role_assignment_global
    ON user_role_assignment (user_id, role_code)
    WHERE organization_membership_id IS NULL;
CREATE UNIQUE INDEX uq_user_role_assignment_membership
    ON user_role_assignment (user_id, organization_membership_id, role_code)
    WHERE organization_membership_id IS NOT NULL;
CREATE INDEX idx_user_role_assignment_user_id ON user_role_assignment (user_id);

CREATE TABLE refresh_token (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_user(id),
    token_hash CHAR(64) NOT NULL,
    token_family_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_refresh_token_hash UNIQUE (token_hash)
);

CREATE INDEX idx_refresh_token_user_id ON refresh_token (user_id);
CREATE INDEX idx_refresh_token_family_id ON refresh_token (token_family_id);
