# Core agricultural domain model

## Identity and organizations

`app_user` remains the sole platform identity and contains no authentication credentials. `farmer_profile` is a one-to-one domain profile over that identity, avoiding a parallel farmer login model. Its `status_code` is deliberately unconstrained until farmer-verification rules are approved.

`organization` remains the shared organization identity. `fpo_profile` and `buyer_profile` are one-to-one semantic profiles over it; one organization may hold both profiles if a future approved use case needs that. Farmers associate with FPOs through existing `organization_membership`, provided that the organization has an FPO profile. No organization role model is created yet because role scope and authorization semantics are not defined.

## Commodity, market, and market price

`commodity` is intentionally small: name, optional external code, and activation flag. Variety, cultivar, grade, and taxonomy are deferred until there is an approved controlled vocabulary.

`market` represents a physical market with optional external code/type code and a WGS84 location. `market_price` is an append-only observation, linked to a commodity and market. It retains observer date, optional covered period, fixed-point minimum/maximum/modal prices, unit, optional arrival quantity, and source name/reference. Multiple sources may report the same market and day, so no speculative uniqueness constraint is imposed.

Prices use `NUMERIC(19,4)` and quantities use `NUMERIC(19,3)`. Floating point is never used for commercial values. Currency remains nullable because source records may not carry one; the data-ingestion contract will decide when it becomes mandatory.

## Supply and lot

`supply` is a supplier declaration, not inventory. It differentiates `EXPECTED_HARVEST` from `AVAILABLE_PHYSICAL`, has one supplier (farmer or organization), and can later be the source of one or more physical lots.

`lot` is a physically identifiable commercial quantity with an immutable identifier, commodity, exactly one supplier, optional source supply, quantities, relevant dates, and a persisted status vocabulary. The status names support the future lifecycle (`DECLARED` through `SETTLED`), but no state-machine transitions or reservations are implemented here.

## Locations and documents

PostGIS uses `geometry(Point,4326)` internally for market and lot-origin locations. Coordinates are longitude/latitude in WGS84; SRID checks and GiST indexes protect/query the data. APIs will later accept and emit GeoJSON, never raw database geometry.

`lot_location` is a one-to-one origin location for a lot. A future requirement for pickup, storage, or delivery locations may add explicitly named location roles rather than overloading this model.

`lot_document` contains metadata and an external immutable object-storage reference only. Binary files are never stored in PostgreSQL. Document classifications and object-storage provider selection remain open decisions.

## Unresolved decisions

- Controlled vocabularies for commodities, units, market types, farmer status, and document types
- Formal FPO membership semantics, dates, and authorization roles
- Market-price currency/normalization rules and source ingestion contracts
- Lot-number issuer, idempotency, and lifecycle-transition rules
- Multiple lot locations and address-level data handling
