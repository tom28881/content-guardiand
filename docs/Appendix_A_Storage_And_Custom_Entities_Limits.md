# Appendix A — Storage and Custom Entities Limits

## Overview
Forge provides two primary storage options:
- Key-Value Store (KV Store) for simple, namespaced data
- Custom Entities for structured, queryable data models

Both are subject to platform quotas and limits applied per app installation and per environment. Always consult the official docs for the latest numbers before relying on a specific limit.

## Key facts and limits (summary)
- Storage quotas are enforced per installation and per environment. If you exceed a quota or limit, storage operations may fail with quota/limit errors.
- KV Store
  - Simple key/value semantics with namespaces, partitions, and query-by-key patterns.
  - Subject to key size, value size, and request budgets. See official quotas for current values.
- Custom Entities
  - Define entities, attributes, and indexes for structured queries.
  - Limits apply to entity size, attribute count/size, index count, and transactions.
- Transactions and request budgets
  - Platform enforces per-minute and concurrent limits. Design for retries and backoff.
- Data residency
  - Storage is hosted in data residency regions aligned with the host product/site and Forge platform capabilities.

## Implementation notes and best practices
- Design storage schemas to stay comfortably within quota headroom and avoid “hot keys.”
- Prefer Custom Entities when you need to query/filter/sort; prefer KV Store for simple lookups.
- Add indexes in Custom Entities only where necessary; monitor query shapes to avoid full scans.
- Keep values small; compress or chunk large payloads; store references instead of large blobs when possible.
- Use idempotent writes and add retry with exponential backoff for transient errors (429/5xx).
- For scheduled/background jobs, checkpoint progress in storage to resume after timeouts.
- Namespacing: use predictable prefixes (e.g., per-site, per-space, per-user) to simplify maintenance and migration.

## References (official)
- Forge Platform quotas and limits: https://developer.atlassian.com/platform/forge/platform-quotas-and-limits/
- Storage API (KV Store): https://developer.atlassian.com/platform/forge/runtime-reference/storage-api-basic/
- Custom Entities (runtime reference): https://developer.atlassian.com/platform/forge/runtime-reference/custom-entities/
- Custom Entities — store structured data: https://developer.atlassian.com/platform/forge/custom-entities-store-structured-data/
- Data residency (Forge): https://developer.atlassian.com/platform/forge/data-residency/

Last verified: 2025-08-07
