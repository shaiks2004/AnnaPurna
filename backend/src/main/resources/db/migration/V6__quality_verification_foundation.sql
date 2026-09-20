CREATE TABLE quality_test (
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

CREATE INDEX idx_quality_test_lot_id ON quality_test (lot_id);
CREATE INDEX idx_quality_test_inspector ON quality_test (inspector_user_id, tested_at DESC);

CREATE TABLE quality_measurement (
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

CREATE INDEX idx_quality_measurement_quality_test_id ON quality_measurement (quality_test_id);
