# Buyer requirement API

## Scope

This module implements the buyer procurement intention foundation only. It stores buyer intent independently of lot, offer, order, and matching logic.

### Implemented

- Buyer requirement creation and read access
- Draft-to-published-to-open-to-closed lifecycle transitions
- Ownership by buyer organization/profile
- Structured quality specification string payload
- Destination delivery location string
- Quantity with explicit unit and positive validation
- Optional target/maximum price and three-letter currency code
- Audit timestamps and optimistic version in responses
- Pagination and simple filters
- OpenAPI exposure under `/api/v1/requirements`
- Read-only matching exposure under `/api/v1/requirements/{requirementId}/matches`

### Planned

- Advanced matching engine consumption beyond the deterministic Task 008 baseline
- Lot comparison against quality specification
- Offer generation and ordering
- Price normalization and conversion
- Multi-buyer or multi-commodity optimization
- Logistics, storage, and settlement workflows

## Ownership and visibility

A `Requirement` belongs to a buyer profile and therefore to the buyer organization behind that profile. Only users with the `BUYER_USER` role in that organization may create, update, publish, or close it. Admin users retain the existing override behavior through `AccessControlService`. Non-owned buyers and farmer/FPO users are denied and treated as `404` to avoid resource disclosure.

Draft requirements are visible to the owning buyer organization only. Published and open requirements use the same organization-scoped visibility model for now, while closed requirements remain readable to authorized actors according to the existing project policy.

## Lifecycle

The implemented lifecycle is intentionally minimal:

- `DRAFT`
- `PUBLISHED`
- `OPEN`
- `CLOSED`

Transitions are server-controlled. Arbitrary status changes are not allowed through `PATCH`. PATCH is limited to draft requirements. Published, open, and closed requirements cannot be edited through this endpoint.

Lifecycle commands are exposed as:

- `POST /api/v1/requirements/{requirementId}/publish`
- `POST /api/v1/requirements/{requirementId}/open`
- `POST /api/v1/requirements/{requirementId}/close`

Only `DRAFT` requirements can be patched. `PUBLISHED`, `OPEN`, and `CLOSED` requirements are immutable through PATCH.

## Quality specification

The quality specification is stored as a structured string payload rather than a hard-coded onion/grape/soybean schema. This keeps the model flexible while avoiding a premature taxonomy. It is intended for future matching, but no matching logic is implemented here.

## Delivery location

The delivery location is stored as a text field representing the procurement destination. This is intentionally simple and aligned with the repo's existing no-external-mapping pattern. Future cost and distance workflows may convert or normalize this data as needed.

## Pagination

List endpoints use the repository pattern already present in the project:

- `page` default `0`
- `size` default `20`
- maximum `100`
- deterministic ordering by newest-created first

## Future relationship to matching

This requirement is the declarative buyer intent record consumed by later matching and aggregation services. No scoring, ranking, or aggregation logic is implemented in this task.
