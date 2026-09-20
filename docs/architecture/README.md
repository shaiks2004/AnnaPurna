# Architecture

## Current scope

The repository is a web-first foundation. `apps/web` is the only executable application today. There is no backend, database, API contract, authentication flow, or domain implementation in this stage.

## Repository boundaries

```text
apps/web              User-facing Next.js application
packages/             Shared code only when multiple applications need it
docs/architecture     Decisions and architectural guidance
```

When justified by active development, future top-level areas may include backend, Android, Windows, ML services, and additional shared packages. They are intentionally absent until there is a defined requirement.

## Web application structure

```text
src/
  app/                Routing, layout, global styles
  components/ui/      shadcn/ui primitives only
  config/             Validated/centralized application configuration
  features/           Business-domain modules as they are introduced
  lib/                Small framework-agnostic helpers
  test/               Test setup
```

Business capabilities should be introduced under `src/features/<domain>`, for example `markets` or `lots`, when their requirements are approved. A feature owns its UI, state, types, and service boundary. Route files remain thin composition layers.

## Client/server boundary

Next.js route and server components may call future backend services through explicitly defined clients. Browser components must not directly access databases, backend credentials, or private environment variables. TanStack Query is reserved for browser-side server-state needs once real API contracts exist.

## Environment variables

`apps/web/.env.example` documents supported variables. Access them through `src/config/env.ts`, not ad hoc `process.env` calls. `NEXT_PUBLIC_` variables are browser-visible and must never contain secrets.

## Quality baseline

- Strict TypeScript with no emitted build artifacts
- ESLint using Next.js core-web-vitals and TypeScript rules
- Prettier for consistent formatting
- Vitest and Testing Library for component-level tests
- Next.js production builds as the integration check

## Deliberate non-decisions

No API, database schema, geospatial model, authentication provider, payment provider, AI/ML service, or domain data model has been selected or implemented. Those decisions require approved product and backend requirements.
