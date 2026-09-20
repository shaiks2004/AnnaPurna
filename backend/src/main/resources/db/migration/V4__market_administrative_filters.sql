ALTER TABLE market
    ADD COLUMN state VARCHAR(128),
    ADD COLUMN district VARCHAR(128);

CREATE INDEX idx_market_state_district ON market (state, district);
