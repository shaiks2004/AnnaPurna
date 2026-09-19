# Market Intelligence API

Status: **IMPLEMENTED**

Base path: `/api/v1`

OpenAPI: `/v3/api-docs`

Swagger UI: `/swagger-ui/index.html`

All endpoints in this document require a valid JWT bearer token unless stated otherwise. No endpoint creates or imports real agricultural data automatically. Market-price observations are supplied by an authorized caller and retain their source fields.

## Common pagination

Collection endpoints use the same zero-based convention:

```text
page=0&size=20
```

The default size is 20 and the maximum size is 100. Responses use:

```json
{
  "data": [],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0
  }
}
```

Default ordering is deterministic: commodities and markets by `name`, then `id`; market prices by `observedOn` descending, then `id` descending.

Validation errors use HTTP 400 with Problem Details and `code: VALIDATION_ERROR`. Cross-field domain validation uses HTTP 422 with `code: INVALID_REQUEST`. Missing resources use HTTP 404. Database uniqueness conflicts use HTTP 409 with `code: DUPLICATE_RESOURCE`.

## Commodity

### `GET /api/v1/commodities`

Authentication: any authenticated user.

Query parameters:

- `search`: case-insensitive substring match on commodity name.
- `page`, `size`: common pagination parameters.

Response item: `CommodityResponse` with `id`, `name`, `commodityCode`, and `active`.

### `GET /api/v1/commodities/{commodityId}`

Authentication: any authenticated user.

Returns one `CommodityResponse`, or 404 when the UUID is not found.

### `POST /api/v1/commodities`

Authentication: `ADMIN`.

Request body: `CommodityCreateRequest`.

```json
{
  "name": "Onion",
  "commodityCode": "ONION",
  "active": true
}
```

`name` and `commodityCode` are required. Names are limited to 255 characters and codes to 64 characters. Response status is 201.

### `PATCH /api/v1/commodities/{commodityId}`

Authentication: `ADMIN`.

Request body: `CommodityPatchRequest`. Fields are optional, but at least one field must be supplied. The same length limits as creation apply. Response status is 200.

Commodity name and code uniqueness is preserved by the existing database constraints; conflicts return 409.

## Market

### `GET /api/v1/markets`

Authentication: any authenticated user.

Query parameters:

- `search`: case-insensitive substring match on market name.
- `state`: case-insensitive exact state filter.
- `district`: case-insensitive exact district filter.
- `commodityId`: returns markets with at least one market-price observation for the commodity.
- `page`, `size`: common pagination parameters.

Filters may be combined. The commodity filter uses the existing `market_price` relationship and does not create a new market/commodity table or invent location data.

Response item: `MarketResponse` with `id`, `name`, `marketCode`, `marketTypeCode`, `state`, `district`, and `active`.

The existing PostGIS `market.location` column is preserved in the domain model but is not serialized by this foundation API. No coordinates are generated or modified.

### `GET /api/v1/markets/{marketId}`

Authentication: any authenticated user.

Returns one `MarketResponse`, or 404 when the UUID is not found.

### `POST /api/v1/markets`

Authentication: `ADMIN`.

Request body: `MarketCreateRequest`.

```json
{
  "name": "Nashik Market",
  "marketCode": "NASHIK",
  "marketTypeCode": "APMC",
  "state": "Maharashtra",
  "district": "Nashik",
  "active": true
}
```

`name` and `marketCode` are required. `marketTypeCode` is limited to 64 characters; `state` and `district` are limited to 128 characters. Response status is 201.

### `PATCH /api/v1/markets/{marketId}`

Authentication: `ADMIN`.

Request body: `MarketPatchRequest`. Fields are optional, but at least one field must be supplied. Response status is 200. Existing location data is not changed by this endpoint.

Market-code uniqueness is preserved by the existing database constraint; conflicts return 409.

## Market price

### `GET /api/v1/market-prices`

Authentication: any authenticated user.

Query parameters:

- `commodityId`: exact commodity UUID filter.
- `marketId`: exact market UUID filter.
- `from`: inclusive `YYYY-MM-DD` observed-date lower bound.
- `to`: inclusive `YYYY-MM-DD` observed-date upper bound.
- `page`, `size`: common pagination parameters.

The date range must not have `from` after `to`. Results are newest observed dates first with deterministic ID ordering.

Response item: `MarketPriceResponse` with commodity/market IDs, observation and covered-period dates, fixed-point price fields, units, optional arrival quantity, `sourceName`, `sourceReference`, and `createdAt`.

### `GET /api/v1/market-prices/{priceId}`

Authentication: any authenticated user.

Returns one source-traceable `MarketPriceResponse`, or 404 when the UUID is not found.

### `POST /api/v1/market-prices`

Authentication: `ADMIN`. No new role was introduced for ingestion.

Request body: `MarketPriceCreateRequest`.

```json
{
  "commodityId": "00000000-0000-0000-0000-000000000000",
  "marketId": "00000000-0000-0000-0000-000000000000",
  "observedOn": "2026-01-15",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "minPrice": 10.0000,
  "maxPrice": 12.0000,
  "modalPrice": 11.0000,
  "currencyCode": "INR",
  "priceUnit": "KG",
  "arrivalQuantity": 100.000,
  "arrivalQuantityUnit": "KG",
  "sourceName": "controlled-source",
  "sourceReference": "source-reference"
}
```

`commodityId`, `marketId`, `observedOn`, `priceUnit`, and `sourceName` are required. Prices use up to 15 integer and 4 fractional digits; quantities use up to 16 integer and 3 fractional digits, matching the existing `NUMERIC(19,4)` and `NUMERIC(19,3)` schema precision. Prices and arrival quantities cannot be negative, minimum price cannot exceed maximum price, and period start cannot exceed period end.

The API does not fabricate prices, arrival volumes, government observations, or external provider data. It does not implement Agmarknet, e-NAM, or other integrations.

## PLANNED, not implemented

The following are outside Task 004: supply and lot APIs, quality verification, buyer requirements, matching, aggregation, offers, orders, logistics, storage, settlement, disputes, forecasting, recommendations, external market-data integrations, and client workflows.