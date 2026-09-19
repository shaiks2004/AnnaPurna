# Matching API

## Scope

Task 008 provides a read-only matching foundation between buyer requirements and eligible lots. It does not create offers, orders, aggregations, reservations, logistics, or payments.

The initial model is a deterministic baseline and is **not trained machine learning**.

## Architecture

```text
Requirement
    |
CandidateLotProvider
    |
Candidate lots
    |
MatchFeatureBuilder
    |
MatchFeatures
    |
MatchModel
    |
MatchScore
    |
MatchRanker
    |
Ranked MatchResults
```

The repository performs only coarse candidate retrieval by requirement commodity and eligible lot status (`VERIFIED` or `AVAILABLE`). It does not calculate scores or determine the final ranking. Feature construction, model evaluation, explanation, and ranking are separate application components.

## Endpoint

`GET /api/v1/requirements/{requirementId}/matches?limit=20`

The limit is between 1 and 100. Results contain the requirement ID, lot ID, bounded score, model name/version, rank, and human-readable explanation. The operation does not mutate requirements or lots.

Matches can be requested only for visible `PUBLISHED` or `OPEN` requirements. Unauthorized requirements are returned as 404 according to the existing anti-IDOR policy.

## Baseline model

The `deterministic-baseline` model uses version `v1`. Initial configurable weights are:

- Commodity: `0.35`
- Quantity: `0.30`
- Quality: `0.20`
- Geography: `0.10`
- Delivery timing: `0.05`

The final score is normalized to `0` through `1`. These are initial business-rule/model parameters and were not learned from production data. A future `MatchModel` implementation can replace this adapter without changing the matching API or feature boundary.

Quantity fit is the available lot quantity divided by the requirement quantity, capped at `1`, only when units match. No unit conversion is performed.

Quality contributes fully when a verified quality test exists, partially when quality evidence exists but is not verified, and zero when no evidence exists.

## Missing data

Missing features are explicit and do not become perfect matches:

- No lot price is modeled, so price is unavailable and not scored.
- Requirement delivery is currently text-only, so geographic distance is unavailable.
- No coordinates are fabricated or geocoded.
- Quality tests are evidence only; no AI or predicted quality is used.
- Missing availability dates do not receive delivery compatibility credit.

## Ranking and explanation

Results are ordered by score descending, then verified-quality evidence, quantity coverage, and lot UUID ascending. The tie-breakers are deterministic business rules, not learned intelligence. Explanations state both positive evidence and unavailable data, such as `Geographic distance unavailable`.

## Planned

Historical model training, quality/specification matching, unit normalization, distance and delivered-cost optimization, aggregation, offers, and orders remain future work.
