# Backend architecture

## Scope and style

Annapurna's backend is a Java/Spring Boot modular monolith. It is the authoritative owner of business rules, authorization, data integrity, and state transitions. The current foundation contains platform wiring, identity/organization persistence, authentication, and the first commodity, market, and market-price APIs.

It is deliberately not a microservice system. There is no Kafka, GraphQL, Kubernetes configuration, payment gateway, or business workflow in this foundation.

## Modules and dependency rules

Code is grouped by domain under `com.annapurna`, with future modules such as `market`, `lot`, and `order` introduced only when approved requirements exist. Each domain owns its API-facing DTOs, application services, persistence model, and domain rules.

`common` provides cross-cutting, dependency-light concerns (errors, configuration, and shared technical conventions). Domain modules may depend on `common`; they must not reach into another module's persistence implementation. Cross-domain behavior is coordinated through explicit application services, not direct repository access.

Implemented domain modules include `user`, `organization`, `commodity`, `market`, `marketprice`, `requirement`, and the model-driven matching foundation; `farmer`, `fpo`, `buyer`, `supply`, and `lot` provide persistence models for current and later workflows. Each implemented API module owns its DTOs, application service, repository, and domain mapping.

## Database strategy

PostgreSQL with PostGIS is the production and local-development database. Flyway owns schema changes in `backend/src/main/resources/db/migration`; Hibernate validates mappings and never creates or alters production schema. Database identifiers are UUIDs. Tables use UTC `timestamptz` audit timestamps and JPA version columns where records are mutable.

The initial schema contains `app_user`, `organization`, and `organization_membership`. Passwords are not stored. Membership uses a foreign-key-constrained join table with a unique user/organization pair. The migration enables PostGIS, readying the database without inventing spatial tables.

## API strategy

HTTP APIs are versioned under `/api/v1`. Spring MVC records are the source DTO contracts, documented by springdoc-openapi as OpenAPI 3.1 at `/v3/api-docs`. This permits future generated TypeScript and Kotlin clients without making generated code part of this repository yet. Implemented agricultural endpoints cover commodity master data, market master data, source-traceable market-price observations, supply declarations, physical lots, lot locations, and safe lot document metadata. Exact contracts are documented in [the market-intelligence API](../api/market-intelligence.md) and [the supply and lot API](../api/supply-lot.md).

Responses use RFC 9457 Problem Details for errors. API-boundary validation uses Jakarta Validation on request DTOs, with cross-field market-price and requirement rules enforced in the application service. Logging is structured through Spring's logging abstraction; secrets and personal data must not be logged.

## Authentication and authorization

The API uses short-lived, stateless HMAC-SHA256 JWT access tokens (15 minutes by default). Tokens contain only standard issuer, audience, subject (user UUID), issued-at, and expiry claims; roles, memberships, and personal data are never put into tokens. The backend validates issuer and audience. `ANNAPURNA_JWT_SECRET` is a required base64-encoded 256-bit key and is never committed.

Password login is a local-profile-only bootstrap mechanism, explicitly disabled by default and enabled in `application-local.yml`. It applies only to users explicitly provisioned with an email and BCrypt password hash in `app_user`; this task creates neither credentials nor registration/onboarding flows. External OTP and production identity providers remain future adapters. Each login issues an opaque refresh token, stored only as a SHA-256 hash. Refresh tokens rotate on use, are revocable, and share a family identifier for future reuse-detection policy.

`user_role_assignment` supports global roles (`FARMER`, `ADMIN`) and organization-scoped roles (`FPO_USER`, `BUYER_USER`, `QUALITY_INSPECTOR`, `LOGISTICS_USER`, `FINANCE_USER`) through an existing organization membership. A membership is one user belonging to one organization; its scoped assignments are therefore tied to a valid user/organization pair. Global roles have no organization scope.

An organization-scoped role assignment requires a corresponding organization membership for the same user and organization. This invariant is enforced by the application service and by a composite database foreign key; global role assignments intentionally have no membership reference.

Application services obtain the caller through `CurrentUser` and resolve memberships/roles through `AuthenticatedUserService`; they use `AuthorizationPolicy` for ownership boundaries rather than controller-local checks. An `ADMIN` may cross ownership boundaries; otherwise farmer resources require the owning user and organization resources require active membership and, where needed, a matching scoped role. For sensitive resources, services should return a non-disclosing not-found response where revealing ownership would leak information.

Only health, authentication token endpoints, and OpenAPI are public. All other routes require bearer authentication. The system is stateless, uses no cookies, and therefore has no browser CSRF session surface. Web, Android, and Windows clients use the same `Authorization: Bearer` contract; clients should keep refresh tokens in platform-appropriate secure storage and never treat UI roles as authorization.

## Spatial data strategy

All stored and exchanged locations use WGS84 / EPSG:4326. `market.location` and `lot_location.location` use PostGIS `geometry(Point,4326)` and GiST indexes. Public APIs will later accept and emit GeoJSON rather than raw PostGIS geometry.

## Core domain model

The core agricultural schema now adds standardized commodities, physical markets, source-traceable market-price observations, farmer/FPO/buyer profiles over the existing identity model, supply declarations, physical lots, lot-origin locations, and lot-document references. Details and unresolved modelling decisions are maintained in [the domain model](domain-model.md).

## Transactions and state changes

Each approved business transition will be explicit, validated in an application service, transactional, and audit-aware. Requirements use server-controlled `DRAFT -> PUBLISHED -> OPEN -> CLOSED` commands; only drafts are editable through PATCH. Matching is a read-only pipeline: coarse candidate retrieval, feature construction, a replaceable `MatchModel`, deterministic ranking, and explanation. Supply and lot creation are transactional; physical lots always start in the server-controlled `DECLARED` state, and the current patch API edits only declared lots without accepting status changes. State machines will be modelled only for domains with approved lifecycle rules. Optimistic locking protects mutable aggregate records; retries and idempotency requirements will be decided per command endpoint.

## Audit strategy

The current schema provides creation/update timestamps and versioning on mutable foundational records. A dedicated `AuditLog` model is not created yet because its retention, actor attribution, event payload, and legal requirements are unknown. Future audit events must be append-only and record authenticated actor and correlation context.

## Compatibility boundaries

The REST/OpenAPI contract is platform-neutral, allowing the web app, future Android application, and future Windows application to consume the same versioned API. A future ML service must integrate through explicit contracts or persisted derived data; it must not bypass domain authorization or write directly to transactional tables.

## Intentionally deferred decisions

- Production identity-provider integration and user onboarding flows
- External identity-provider and OTP adapters, user provisioning/onboarding, refresh-token reuse response policy, and fine-grained domain permissions
- Detailed agricultural domain schema and workflows
- Redis usage and caching policy
- Object/document storage
- Audit-log retention and compliance policy
- Asynchronous messaging, Kafka, and service decomposition
- Payment, logistics, matching, and ML integrations
