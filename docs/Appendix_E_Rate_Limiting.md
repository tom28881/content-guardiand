# Appendix E — Confluence Cloud REST API Rate Limiting

## Overview
Confluence Cloud enforces rate limits to protect the platform. Forge apps invoking Confluence REST APIs (either as the user or as the app) are subject to these limits. Exceeding limits results in HTTP 429 responses and callers must respect backoff guidance.

## Key facts and behavior (summary)
- Limits vary by endpoint and are adjusted dynamically; Atlassian does not publish fixed per-route numbers. Always consult the official page for current behavior.
- On limit breaches, Confluence returns:
  - `HTTP 429 Too Many Requests`
  - A `Retry-After` response header indicating the minimum seconds to wait before retrying
- For apps, throttles may apply at multiple levels:
  - User-context calls (`asUser`) can count against user and route-level budgets
  - App-context calls (`asApp`) count against the app’s budget for the tenant
- Pagination is mandatory for large result sets. Expect to iterate over pages over time rather than in a single burst.

## Implementation notes and best practices
- Backoff and retry
  - Honor `Retry-After` strictly; do not retry before the specified time.
  - Use exponential backoff with jitter for subsequent retries on 429/5xx.
  - Make operations idempotent so they can be safely retried.
- Concurrency control
  - Cap global and per-route concurrency; use a token bucket or queue to smooth bursts.
  - Spread scheduled/background jobs and checkpoint progress in storage to avoid thundering herds.
- Request efficiency
  - Cache results where possible; avoid redundant fetches.
  - Use selective fields/expansions and small page sizes tuned for stability.
  - Prefer webhooks/events over polling when supported.
- Observability
  - Log 429s with route, tenant, and `Retry-After` value; emit metrics to tune concurrency/backoff.

### Example 429 response (illustrative)
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json

{"error":"rate_limited","message":"Too many requests"}
```

## References (official)
- Confluence Cloud rate limiting: https://developer.atlassian.com/cloud/confluence/rate-limiting/

Last verified: 2025-08-07
