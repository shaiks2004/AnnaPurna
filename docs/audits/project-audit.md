# Annapurna Project Audit

Audit date: 2026-09-18
Repository: `C:\Enterprenuer Pitchs\SIH\AnnaPurna-VMPLG`

This is a read-only technical audit. No application source, migration, dependency, or configuration fix was applied.

## 1. Executive Summary

The repository is a Java 21/Spring Boot modular-monolith backend plus a small Next.js web foundation. The source contains identity, organization, agricultural persistence mappings, JWT authentication, authorization policy primitives, Flyway migrations, and a health/OpenAPI surface. It does not yet contain commodity, market, market-price, supply, or lot HTTP APIs, application services, repository interfaces for those domains, workflows, or client integration.

The web checks are healthy: the existing Vitest test passes, ESLint completes with one warning, and the production Next.js build succeeds. The backend Maven command exits successfully, but the PostGIS/Testcontainers migration test is skipped because Docker is unavailable; therefore migrations were not executed by the local test run. Backend packaging with `-DskipTests` succeeds.

The most important security/integrity finding is that `user_role_assignment.organization_membership_id` is foreign-key constrained, but the schema does not enforce that the referenced membership belongs to the same `user_id` on the role assignment. No current write API was found, so this is a latent privilege/integrity risk for future provisioning or administration code. The documentation is also materially stale: architecture documents describe a web-only foundation with no backend/domain implementation, while the repository now contains backend domain schema and authentication code.

Recommended next implementation step: Task 004, Commodity + Market + Market Price APIs, but only after resolving the role-assignment integrity design, establishing a Docker-enabled migration validation path, and updating the contradictory architecture documentation.

## 2. Repository Structure

Observed top-level tracked/workspace areas:

- `apps/web`: Next.js 16.3.5, React 19, TypeScript, Tailwind CSS 4/PostCSS, Vitest, Testing Library, ESLint.
- `backend`: Spring Boot 3.5.6 Maven project with Java 21 target, Spring Security, JPA/Hibernate Spatial, PostgreSQL, PostGIS, Flyway, springdoc, and Testcontainers tests.
- `docs/architecture`: backend, domain-model, and architecture guidance.
- `packages`: contains only `.gitkeep`; no shared package implementation.
- Root npm workspace configuration and lockfile.
- `.vscode/settings.json`.

Not found at the repository root:

- `ml/`
- `infrastructure/`
- `scripts/`
- `.github/` CI configuration
- Android or Windows client projects
- backend API contract/client-generation package

Additional observed material:

- `backend/bin/` contains a duplicate Maven project tree and generated build material (`pom.xml`, wrapper/configuration, source/resources, and `target/`). It is not described as an intentional module and creates a source-of-truth/drift risk.
- `backend/target/` is generated output and is ignored by the root `.gitignore`.
- Docker configuration exists at `backend/docker-compose.yml`; it defines one PostGIS service and a named volume. Local startup requires `POSTGRES_PASSWORD` through an environment file.

## 3. Implemented Architecture

The implemented backend follows a modular-monolith package layout under `com.annapurna`: `auth`, `user`, `organization`, `farmer`, `fpo`, `buyer`, `commodity`, `market`, `marketprice`, `supply`, `lot`, and `common`.

The implemented HTTP path is thin controller -> service/domain support -> repository/database for authentication. `AuthController` delegates to `AuthenticationService`; identity context is resolved through `AuthenticatedUserService` and repository interfaces. The health controller is deliberately process-level and has no persistence dependency.

The future agricultural modules currently contain JPA entities/enums only. No agricultural controller, application service, or repository was found. Consequently, the full Controller -> Service -> Repository -> Database pattern is not yet implemented for Task 004 or later APIs.

Positive observations:

- `AuditableEntity` centralizes UUID identity, JPA optimistic locking, and timestamps for mutable entities.
- `open-in-view` is disabled.
- REST error handling uses Spring Problem Details for selected exceptions.
- DTO records are used for login, refresh, and token responses; entities are not returned by the existing controllers.
- No circular module dependency or business logic in agricultural controllers was observed because those controllers do not yet exist.

Gaps:

- No domain service transaction boundaries exist for agricultural writes.
- No agricultural request/response DTOs or mappers exist.
- `PageResponse` exists, but no endpoint uses it; pagination conventions are therefore not demonstrated.
- Exception handling does not visibly cover all validation, malformed UUID, authorization, or generic application failure cases.

## 4. Backend Module Map

| Module                   | Observed implementation                                                                                                | HTTP surface                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `common`                 | persistence base class, security configuration, OpenAPI, health, Problem Details helpers                               | `GET /api/v1/health`          |
| `auth`                   | JWT properties/token service, password login, opaque refresh tokens, role and membership resolution, policy primitives | login, refresh, logout, `/me` |
| `user`                   | `PlatformUser` entity                                                                                                  | none                          |
| `organization`           | `Organization`, `OrganizationMembership` entities                                                                      | none                          |
| `commodity`              | `Commodity` entity                                                                                                     | none                          |
| `market`                 | `Market` entity with PostGIS point and state/district                                                                  | none                          |
| `marketprice`            | append-only-style `MarketPrice` entity                                                                                 | none                          |
| `farmer`, `fpo`, `buyer` | profile entities                                                                                                       | none                          |
| `supply`                 | `Supply`, `SupplyKind`                                                                                                 | none                          |
| `lot`                    | `Lot`, `LotLocation`, `LotDocument`, `LotStatus`                                                                       | none                          |

## 5. Database Schema Review

Flyway migrations observed, in order:

1. `V1__initial_foundation.sql`: enables PostGIS and creates `app_user`, `organization`, and `organization_membership`.
2. `V2__core_agricultural_domain.sql`: creates commodity, market, market price, profiles, supply, lot, lot location, and lot document tables.
3. `V3__identity_and_authorization.sql`: adds local-login fields, role assignments, and refresh tokens.
4. `V4__market_administrative_filters.sql`: adds market state/district and an index.

Schema strengths:

- UUID primary keys are used throughout.
- Mutable entities generally have `version`, `created_at`, and `updated_at`; immutable observation/token/document records use appropriate reduced timestamp/version models.
- Commercial prices use `NUMERIC(19,4)` and quantities use `NUMERIC(19,3)`.
- PostGIS uses `geometry(Point,4326)` for market and lot locations, SRID checks, and GiST indexes.
- Important uniqueness constraints exist for emails, commodity names/codes, market codes, lot numbers, one-to-one profiles, membership pairs, refresh-token hashes, and document storage references.
- Positive supply/lot quantities and basic market-price/period ranges are constrained.
- `lot_location` and `lot_document` cascade on lot deletion; most other relationships use the database default restrictive behavior.

Integrity and modelling observations:

- `user_role_assignment` has separate `user_id` and `organization_membership_id` foreign keys but no composite constraint proving that the membership belongs to that user. This permits inconsistent scoped role rows at the database boundary and must be resolved before provisioning/admin APIs.
- There is no uniqueness or check rule tying a lot's `source_supply_id` to the same commodity or supplier. This may be intentional for the foundation, but future lot creation services must enforce it.
- `supply` and `lot` each enforce exactly one farmer or organization supplier, but there is no aggregation/procurement-lot relationship. Source lots cannot yet be represented as children of an aggregated lot.
- `market_price` has source name/reference traceability and indexes, but currency is nullable, units are free text, and modal-price containment in min/max is not constrained. These require an ingestion/normalization contract.
- Timestamp updates are JPA callback driven rather than database-trigger driven; direct SQL writers would not automatically update `updated_at`.
- PostGIS SRID is constrained, but coordinate range validation and GeoJSON API serialization are not implemented.
- The migration test asserts three migrations even though four migration files exist. It is skipped in the current environment, so this defect has not been exercised locally.

## 6. Authentication Review

Implemented endpoints and behavior:

- JWT access tokens are signed with HS256 through Nimbus/Spring Security.
- Decoder validation uses the configured issuer, default JWT validators for signature/time claims, and a custom audience validator.
- Access-token TTL is configured as 15 minutes.
- JWT claims contain issuer, subject, audience, issued-at, and expiry; roles and memberships are not included.
- Refresh tokens are opaque, generated with `SecureRandom`, returned once, stored as SHA-256 hex hashes, have expiry and revocation timestamps, and are rotated on refresh.
- Password login is controlled by `annapurna.security.local-password-login-enabled` and defaults to disabled outside the local profile. BCrypt is used for password verification.
- Authentication is stateless and uses bearer tokens; no server session is configured.

Limitations and risks:

- Refresh-token reuse detection is not implemented: a revoked token is rejected, but its token family is not revoked or otherwise marked compromised. The token family field is currently used for continuity only.
- Login/refresh/logout behavior lacks dedicated service-level or integration tests in the inspected test suite.
- `CurrentUser` assumes a valid UUID subject and throws `IllegalStateException` for an unexpected authenticated principal; malformed authenticated subjects are not covered by a controlled API error test.
- `csrf()` is disabled, which is appropriate for a bearer-only stateless API, but no CORS policy is configured. Browser clients hosted on another origin will need an explicit, reviewed CORS policy before integration.
- The broad `/api/v1/auth/**` matcher permits any future route under that prefix. Current routes are intended to be public, but new authentication-adjacent routes must be reviewed carefully.
- Local application logging sets `com.annapurna` to DEBUG. No token/password logging was found, but this profile should be treated as development-only.
- The test profile contains a fixed test JWT secret. It is not a production credential, but it must remain isolated from deployed environments.

## 7. Authorization Review

`AuthorizationPolicy` centralizes three concepts: organization membership, farmer ownership, and organization-scoped roles. `ADMIN` is treated as a global override. `AuthenticatedUserService` resolves memberships and role assignments from the database for each load, and JWT claims are not trusted for authorization.

Current authorization coverage is foundational rather than end-to-end:

- Unit tests verify farmer ownership, organization membership/scoped role checks, and admin override.
- `/api/v1/me` requires authentication but has no business role requirement, which is appropriate.
- No current agricultural resource endpoint exists against which organization boundaries or IDOR protections can be verified.
- No role-assignment provisioning endpoint or membership lifecycle exists.

The role-assignment cross-user membership integrity gap in Section 5 is the main authorization-adjacent risk. Future write paths must enforce both application policy and database-level consistency.

## 8. API Inventory

| Method | Path                   | Auth                               | Role                   | Organization scope      | Ownership | Request/response                       |
| ------ | ---------------------- | ---------------------------------- | ---------------------- | ----------------------- | --------- | -------------------------------------- |
| GET    | `/api/v1/health`       | Public                             | None                   | None                    | None      | None / `HealthResponse`                |
| POST   | `/api/v1/auth/login`   | Public; local flag must be enabled | None                   | None                    | None      | `LoginRequest` / `AuthTokenResponse`   |
| POST   | `/api/v1/auth/refresh` | Public bearer not required         | None                   | None                    | None      | `RefreshRequest` / `AuthTokenResponse` |
| POST   | `/api/v1/auth/logout`  | Public bearer not required         | None                   | None                    | None      | `RefreshRequest` / `204 No Content`    |
| GET    | `/api/v1/me`           | Required                           | Any authenticated user | Server-resolved context | Caller    | None / `MeResponse`                    |

OpenAPI is configured at `/v3/api-docs`; Swagger UI is configured at `/swagger-ui`. The OpenAPI test verifies version 3.1 and bearer scheme metadata. No commodity, market, market-price, supply, lot, quality, order, logistics, settlement, or admin API was found.

REST/API gaps for future work:

- No pagination, filtering, sorting, idempotency, concurrency, or resource status API contract exists yet.
- No agricultural request/response validation contract exists.
- No documented status-code matrix exists beyond the controller annotations and tests.
- Security documentation in OpenAPI is present for `/me`; business endpoints do not yet exist to verify consistent annotations.

## 9. Test Coverage

Backend test files observed:

- `ApplicationContextTest`: Spring context startup under the test profile; passed.
- `SystemApiTest`: health, OpenAPI, unauthenticated rejection, invalid bearer rejection, and authenticated `/me`; passed.
- `PasswordHashingTest`: BCrypt behavior; passed.
- `AuthorizationPolicyTest`: ownership, membership, scoped role, and admin override; passed.
- `MigrationTest`: PostGIS/Testcontainers migration test; skipped because Docker was unavailable.

Observed Maven report result for this run: 11 tests passed, 0 failed, 0 errored, and 1 test skipped. The Maven process exited `0`; the skipped migration test must not be counted as passed. No repository-level JPA CRUD tests, authentication rotation tests, refresh revocation tests, controller tests for login/refresh/logout, authorization integration tests, or agricultural API tests exist.

Web test files observed:

- `apps/web/src/app/page.test.tsx`: one rendering test; passed.

Testcontainers is configured for PostgreSQL/PostGIS, but Docker was not available in this environment. A database-backed migration result is therefore `NOT VERIFIED` locally.

## 10. Build Validation

Commands run:

- `backend\\mvnw.cmd test -q`: exit `0`; four test classes passed and `MigrationTest` was skipped due unavailable Docker.
- `backend\\mvnw.cmd package -DskipTests -q`: exit `0`; package succeeded.
- `apps/web` `npm run test`: exit `0`; 1 test passed.
- `apps/web` `npm run lint`: exit `0`; 0 errors and 1 warning in `postcss.config.mjs` for anonymous default export.
- `apps/web` `npm run build`: exit `0`; Next.js production build succeeded.

Build environment notes:

- Maven ran on Java 25.0.2 while the project enforces Java `[21,26)` and declares Java 21 source compatibility. This is within the configured range, but Java 21 itself was not used for this audit.
- Maven emitted deprecated `sun.misc.Unsafe` and dynamic Mockito/Byte Buddy agent warnings. They did not fail the build.
- Docker Compose startup was not verified; the checked-in compose file requires `POSTGRES_PASSWORD` and the environment reported a failed `docker compose up -d postgres` attempt.

## 11. Configuration & Secrets Review

No tracked real credential, API key, private key, or production JWT secret was identified from the inspected filenames/configuration. The repository has `.gitignore` entries for `.env`, local env files, logs, build output, and dependencies.

Placeholder/configuration values observed:

- `backend/.env.example` and `backend/bin/.env.example` contain placeholder database values such as `change-me` and an empty JWT secret. These are examples, not verified live credentials.
- `backend/src/test/resources/application-test.yml` contains a fixed base64 test JWT secret for tests. Severity: LOW/INFO, provided it remains test-profile-only and is never reused.
- `apps/web/.env.example` contains only the public app name.

Secret scan status: no real secret verified. Full history scanning and external secret-manager verification were not performed: `Not verified — requires manual/environment verification.`

## 12. Dependency Review

Backend dependencies align with the declared architecture: Spring Web/Validation/Data JPA/Security, OAuth2 resource server, Hibernate Spatial/JTS, PostgreSQL, Flyway, springdoc, Spring test, Spring Security test, and Testcontainers PostgreSQL/JUnit.

Web dependencies align with the current foundation: Next.js, React, Tailwind/PostCSS, Radix slot, class variance utilities, Lucide, Vitest, Testing Library, TypeScript, and Next ESLint configuration.

No obvious duplicate dependency declaration was found in `backend/pom.xml` or `apps/web/package.json`. TanStack Query is not installed despite the stated future frontend direction; no current API integration requires it. No dependency upgrades or vulnerability database audit was performed. Version freshness and transitive CVEs are `Not verified — requires manual/environment verification.`

The duplicated `backend/bin` project may carry a second dependency/configuration source and should be treated as a repository hygiene risk until its purpose is confirmed.

## 13. Documentation Consistency

The README and `docs/architecture/README.md` state that the repository is a web-only foundation with no backend, API, database model, authentication flow, or domain implementation. That statement conflicts with the current backend source, four Flyway migrations, agricultural entities, and authentication implementation.

`docs/architecture/backend.md` and `docs/architecture/domain-model.md` describe many of the implemented backend/security/schema concepts accurately, including modular-monolith intent, JWT design, PostGIS, supply-versus-lot distinction, and deferred aggregation. However, they still describe portions as foundation/future behavior and do not provide the current endpoint inventory or test limitations.

There is no dedicated API contract document, environment runbook covering the current Docker prerequisite failure, or audit documentation before this file. No `.env.example` is present at the repository root, but backend and web examples exist in their respective applications.

## 14. Architectural Risks

1. Farmer/FPO aggregation: source lots and procurement/aggregated lots have no parent-child or aggregation model. `source_supply_id` alone does not represent many source lots contributing to one procurement lot.
2. Lot lifecycle: status values exist, but transitions, reservation rules, idempotency, actor attribution, and concurrency behavior are not implemented.
3. Quality verification: no quality sample, inspection, evidence, result, or immutable lot-passport model exists.
4. Buyer requirements and matching: no requirement, matching, explainability, or versioned decision model exists.
5. Organization boundaries: the policy primitive exists, but resource services and database-level membership consistency are absent.
6. Market-price traceability: source fields exist, but normalization, currency policy, unit vocabulary, ingestion identity, correction policy, and provenance versioning are open.
7. Delivered cost: no cost components, location route, storage, handling, or calculation snapshot model exists.
8. Settlement: no order, invoice, payment, ledger, reconciliation, or settlement state model exists.
9. Auditability: timestamps/versioning exist, but there is no append-only actor/event audit log.
10. Multi-client compatibility: the versioned API direction is sound, but there are not yet business DTO contracts consumed by web, Android, or Windows clients.
11. PostGIS serialization: entities use JTS geometry, but GeoJSON request/response mapping and coordinate validation are not implemented.
12. Pagination: a reusable `PageResponse` exists, but no endpoint demonstrates stable ordering or cursor/offset policy.
13. Concurrency: JPA version fields cover many mutable rows, but command-level retry/conflict semantics are not defined.
14. Transaction consistency: only authentication operations are transactional; future cross-table domain commands need explicit transaction boundaries and integrity checks.
15. Repository drift: the duplicate `backend/bin` tree can diverge from the authoritative `backend` tree.

## 15. Findings by Severity

### CRITICAL

None observed from static inspection and the available non-destructive checks.

### HIGH

- **H-001 - Scoped role assignment lacks same-user membership integrity.** `user_role_assignment` separately references `user_id` and `organization_membership_id`; no composite foreign key or equivalent constraint ensures the membership belongs to that user. A future provisioning path that writes an inconsistent row could grant a user roles through another user's membership context. No current write endpoint was found, so exploitability in the current surface is not verified, but the authorization foundation should not be extended until this invariant is designed.

### MEDIUM

- **M-001 - Database migration validation is not executed locally.** `MigrationTest` is skipped when Docker is unavailable, and the test suite does not validate the four migrations in this environment. The test source also asserts three migrations although four exist.
- **M-002 - Authentication rotation/reuse behavior is under-tested.** No tests verify login, refresh rotation, logout revocation, expired/revoked token rejection, token-family reuse response, or database persistence.
- **M-003 - Architecture documentation contradicts implementation.** Root and architecture README claims are stale relative to the backend/domain/auth code, which can misroute future implementation and onboarding.
- **M-004 - Future domain APIs have no service/DTO/transaction contract yet.** The entity schema exists without the application layer needed to enforce supplier, ownership, lifecycle, and organization invariants.
- **M-005 - Source-of-truth duplication under `backend/bin`.** Duplicate project/configuration/build material can cause edits or commands to target the wrong tree.

### LOW

- **L-001 - Web lint warning.** `apps/web/postcss.config.mjs` produces one anonymous-default-export warning.
- **L-002 - CORS policy is not configured.** This is not currently exercised because no browser-to-backend integration exists, but cross-origin client integration will need a deliberate allowlist.
- **L-003 - Test JWT secret is fixed in the test profile.** It is appropriate for isolated tests but must not be promoted to local/staging/production configuration.
- **L-004 - No CI configuration is present.** Build/test checks are not visibly automated in the repository.

### INFO

- `ml/`, Android, Windows, Kafka, Kubernetes, GraphQL, OpenSearch, and other deferred infrastructure were not found; this is consistent with the stated initial architecture.
- No production credentials or real secrets were verified.
- The web app is intentionally a foundation screen with one component test and no backend integration.

## 16. Completed Work Verification

### Task 001 - Repository/Web Foundation

**PARTIALLY VERIFIED.** The Next.js/TypeScript web foundation, environment access pattern, linting, test setup, and production build are present and validated. The root README is stale about the repository as a whole because it omits the now-present backend.

### Task 002 - Core Agricultural Domain

**PARTIALLY VERIFIED.** Migrations and JPA entities exist for commodity, market, market price, profiles, supply, lot, locations, and documents, with the supply/lot distinction represented. No APIs, workflows, aggregation relationship, quality model, or database-backed migration execution was verified locally.

### Task 003 - Identity, Authentication & Authorization

**PARTIALLY VERIFIED.** JWT validation, issuer/audience checks, local password gating, BCrypt, opaque hashed refresh tokens, rotation, revocation, server-side role resolution, centralized policy primitives, and basic API/security tests are present. End-to-end persistence behavior, refresh reuse handling, provisioning, and full organization/resource authorization are not implemented or verified.

## 17. Recommended Next Step

The expected next implementation is **Task 004: Commodity + Market + Market Price APIs**. The foundation is sufficiently structured to proceed after these prerequisites are addressed or explicitly accepted:

1. Decide and enforce the user/membership invariant for scoped role assignments.
2. Make Docker/PostGIS available in the development/CI path and run the migration test against all four migrations; correct the stale migration-count assertion in the test when implementation work resumes.
3. Reconcile the root and architecture documentation with the current backend state.
4. Define Task 004 DTOs, validation, pagination/filtering, authorization scope, source traceability, and transaction/error conventions before adding controllers.

No Task 004 implementation was performed during this audit.

## 18. Files Inspected

Major inspected paths:

- `README.md`
- `package.json`, `package-lock.json`, `.gitignore`, `.vscode/settings.json`
- `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`, `apps/web/eslint.config.mjs`, `apps/web/vitest.config.ts`, `apps/web/.env.example`
- `apps/web/src/app/*`, `apps/web/src/config/env.ts`, `apps/web/src/test/setup.ts`
- `backend/pom.xml`, `backend/docker-compose.yml`, `backend/.env.example`, `backend/mvnw.cmd`
- `backend/src/main/resources/application.yml`, `application-local.yml`, and all four `db/migration/V*.sql` files
- `backend/src/main/java/com/annapurna/common/*`
- `backend/src/main/java/com/annapurna/auth/*`
- `backend/src/main/java/com/annapurna/user/*`, `organization/*`, `commodity/*`, `market/*`, `marketprice/*`, `farmer/*`, `fpo/*`, `buyer/*`, `supply/*`, `lot/*`
- All five backend test classes under `backend/src/test/java`
- `backend/src/test/resources/application-test.yml`
- `docs/architecture/README.md`, `backend.md`, and `domain-model.md`
- `backend/bin/` duplicate project/configuration presence and generated `target/` report output

Not exhaustively inspected: dependency transitive vulnerability databases, full Git history, external deployment environments, live database contents, and production secret stores. Those items remain `Not verified — requires manual/environment verification.`
