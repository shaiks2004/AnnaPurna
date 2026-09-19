# Quality and Lot Passport API

Status: **IMPLEMENTED FOUNDATION**

Base path: `/api/v1`

OpenAPI: `/v3/api-docs`

Quality-related endpoints are a foundation layer only. They establish evidence provenance, inspector authorization, and a lot passport read model without implementing buyer requirements, matching, AI grading, or settlement logic.

## Quality domain

The repository does not contain an earlier quality model. A minimal relational structure was introduced for:

- `quality_test`
- `quality_measurement`

This keeps measurement data flexible, commodity-agnostic, and suitable for future buyer requirement comparisons without hardcoding every commodity attribute as a column.

Key principle: a declaration or AI-like prediction is not the same as verified lab or inspector evidence.

## Quality test lifecycle

The implemented lifecycle is:

```text
CREATED -> SAMPLED -> TESTED -> VERIFIED
        \-> REJECTED
```

- A test is created with `CREATED`.
- A quality inspector may advance it through the allowed chain.
- A verified test is not silently editable.
- Verification is server-controlled and cannot be modified through arbitrary patch requests.
- `REJECTED` is a terminal state for this foundation task.

## Authorization

Only `QUALITY_INSPECTOR` and `ADMIN` may create or verify quality test evidence. Farmers and FPO users can view permitted lot quality data, but they cannot authoritatively verify a lot. All operations still enforce the lot’s owner access rules.

## Measurement model

Measurements are stored as `quality_measurement` rows with:

- `metric_name`
- `numeric_value`
- `unit`
- `text_value`

This is intentionally flexible enough for onion moisture, grape brix, soybean defects, and future commodity-specific quality rules. Numeric fields remain fixed-precision `NUMERIC(19,4)`.

## Lot passport

`GET /api/v1/lots/{lotId}/passport` returns a read-oriented snapshot assembled from existing records:

- lot metadata
- supplier identity
- origin location metadata
- lot documents
- all quality tests for the lot
- the latest verified quality result

It is assembled in the application service and does not create a duplicate persistence table.

## Known limitations / deferred work

- No AI quality grading
- No laboratory integration
- No object-storage integration
- No buyer-requirement matching
- No aggregation or lot passport persistence table
- No audit subsystem yet; future Task 014 may add formal audit eventing

## Endpoints

- `POST /api/v1/lots/{lotId}/quality-tests`
- `GET /api/v1/lots/{lotId}/quality-tests`
- `GET /api/v1/quality-tests/{testId}`
- `POST /api/v1/quality-tests/{testId}/results`
- `GET /api/v1/quality-tests/{testId}/results`
- `POST /api/v1/quality-tests/{testId}/verify`
- `GET /api/v1/lots/{lotId}/passport`
