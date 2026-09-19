# Supply and Lot API

Status: **IMPLEMENTED FOUNDATION**

Base path: `/api/v1`

OpenAPI: `/v3/api-docs`

All endpoints require a valid JWT bearer token. Unauthorized resources are represented as 404 for single-resource reads to avoid confirming whether another producer's record exists.

## Supply versus lot

`Supply` is an expected or declared quantity of agricultural commodity. It may represent an expected harvest or physically available supply declaration.

`Lot` is a physically identifiable quantity. A lot may optionally reference one source supply, but the two concepts remain separate. Task 005 does not aggregate multiple farmer/FPO lots into a procurement lot.

## Common pagination

Supply and lot collection endpoints use the Task 004 convention:

```text
page=0&size=20
```

The default size is 20 and the maximum size is 100. Responses use the shared `data` and `page` metadata envelope. Ordering is deterministic by descending UUID for the current foundation.

## Ownership and authorization

- A supplier is exactly one farmer profile or one organization. Requests containing neither or both are rejected.
- A farmer may create or update records for a farmer profile owned by the authenticated user.
- An FPO user may create or update organization-owned records only for an FPO organization where the user has the `FPO_USER` role.
- An organization must have an `fpo_profile` before it can own new supply or lots through these APIs.
- An `ADMIN` retains the existing global override.
- Buyers and unrelated users cannot create or modify producer records.
- List results are scoped to the caller's own farmer records and organization memberships. Admins can list all records.
- Single-resource read, location, and document access applies the same ownership boundary and hides unauthorized records as 404.

## Supply endpoints

### `POST /api/v1/supplies`

Creates a supply declaration. Required fields are `commodityId`, exactly one of `farmerId` or `organizationId`, `supplyKind`, positive `quantity`, and `quantityUnit`. Expected-harvest and availability dates are supported by the existing schema. Response status is 201.

### `GET /api/v1/supplies`

Returns visible, paginated supply declarations. Supported filters are `commodityId`, `farmerId`, `organizationId`, `supplyKind`, `expectedFrom`, `expectedTo`, and `availableFrom`, in addition to `page` and `size`.

### `GET /api/v1/supplies/{supplyId}`

Returns one visible supply declaration or 404.

### `PATCH /api/v1/supplies/{supplyId}`

Updates supply kind, positive quantity, unit, and supported dates. Supplier and commodity identity are immutable through this API. Response status is 200.

## Lot endpoints

### `POST /api/v1/lots`

Creates a physical lot. `lotNumber`, `commodityId`, exactly one supplier, positive quantity, and quantity unit are required. `sourceSupplyId` is optional; when present, its commodity and supplier must match the lot. The caller must provide the lot number because the existing schema has uniqueness but no safe server-side sequence. Response status is 201.

### `GET /api/v1/lots`

Returns visible, paginated lots. Supported filters are `search` for lot number, `commodityId`, `farmerId`, `organizationId`, `sourceSupplyId`, `status`, `availableFrom`, and `availableTo`, in addition to `page` and `size`.

### `GET /api/v1/lots/{lotId}`

Returns one visible lot or 404.

### `PATCH /api/v1/lots/{lotId}`

Updates only quantity, quantity unit, harvest date, and available date. Supplier, commodity, source supply, lot number, and status cannot be changed. Only `DECLARED` lots are editable. Response status is 200.

## Lot lifecycle

The existing vocabulary remains:

```text
DECLARED -> COLLECTED -> SAMPLED -> VERIFIED -> AVAILABLE
                                           -> RESERVED -> DISPATCHED -> DELIVERED -> SETTLED
```

Task 005 implements only the safe initial state: every newly created lot is `DECLARED`. No client may set or advance status, and PATCH rejects non-declared lots. Quality verification, reservations, logistics, delivery, and settlement transitions remain planned.

## Lot locations

### `GET /api/v1/lots/{lotId}/location`

Returns the owned lot's origin location as a GeoJSON-compatible object:

```json
{
  "lotId": "uuid",
  "type": "Point",
  "coordinates": [73.789, 19.997]
}
```

### `PUT /api/v1/lots/{lotId}/location`

Creates or replaces owned lot location metadata. Coordinates are longitude/latitude in WGS84, constrained to valid ranges, and stored as the existing PostGIS `geometry(Point,4326)`. No coordinates are invented and no external map service is called. Only declared lots may change location metadata.

## Lot documents

### `GET /api/v1/lots/{lotId}/documents`

Returns safe metadata for owned lot documents.

### `POST /api/v1/lots/{lotId}/documents`

Adds metadata containing `documentTypeCode`, opaque `storageReference`, and optional filename, content type, and checksum. It does not upload, download, or fetch file content. URI-style references containing `://` are rejected. Only declared lots may receive new document metadata.

## Database and concurrency

No Flyway migration was required. The existing `supply`, `lot`, `lot_location`, and `lot_document` tables already support this foundation. Existing UUID, positive-quantity, supplier XOR, unique lot-number, PostGIS SRID, foreign-key, and optimistic-version constraints are preserved. JPA optimistic-lock conflicts map to HTTP 409 with `code: CONCURRENT_UPDATE`.

## PLANNED, not implemented

Quality testing and lot passports, buyer requirements, matching, aggregation, offers, orders, logistics, storage, payments, settlement, disputes, external market integrations, file storage, and lifecycle transition commands are later work. The source-supply relationship is preserved, but Farmer A/B/C aggregation into a procurement lot is explicitly deferred to Task 009.