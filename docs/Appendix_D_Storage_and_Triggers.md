# Appendix D — Storage and Scheduled Triggers

## Overview
Scheduled triggers in Forge run backend functions on a defined schedule to perform background work (e.g., sync, clean-up, reporting). These executions and any storage operations they perform are subject to platform quotas and limits. Build triggers to be idempotent and resilient to retries and intermittent failures.

## Key facts and limits (summary)
- Definition and scheduling
  - Scheduled triggers are declared in the app manifest and bind a schedule to a Forge function.
  - Atlassian enforces minimum/maximum schedules and may throttle overly aggressive intervals. Always verify the current limits.
- Execution budgets
  - Each invocation runs within Forge function resource/time budgets. Long operations should be split and checkpointed.
- Storage interaction
  - Triggered jobs often read/write to KV Store or Custom Entities. All storage limits still apply (object size, transactions, indexes).
- Error handling and retries
  - Transient failures can occur (e.g., network, API 429). Implement safe retries with exponential backoff and idempotent writes.
- Observability
  - Use logging and metrics to track run duration, processed items, success/failure counts, and checkpoint positions.

## Implementation notes and best practices
- Slice work into small batches and checkpoint progress in storage to resume after timeouts or restarts.
- Use idempotent operations (e.g., upsert with deterministic keys) to tolerate retries.
- Respect product API limits when calling Confluence/Jira from triggers. Apply concurrency caps and backoff on 429/5xx.
- Keep storage items small; prefer references to large payloads and avoid hot keys.
- Treat schedule as “best effort”: triggers can be delayed. Code should handle re-entrancy and late execution.

## App configuration in this repository
- Manifest scheduled trigger
  - Key: `daily-scan`
  - Interval: `day`
  - Function: `scheduled-scan` → handler `backend/index.scan`
- Runtime guard
  - The handler checks `settings.schedule.mode` and only runs when it equals `auto` (default is `manual`).
  - Toggle can be managed in Settings UI via checkbox “Enable daily scheduled scan”.
- Handler behavior
  - Calls `runSimulatedScan(40)` which generates demo detections and writes audit entries using Forge Storage API.
  - Errors are caught and logged; return value is ignored by the platform (per docs).

## References (official)
- Scheduled trigger module (manifest): https://developer.atlassian.com/platform/forge/manifest-reference/modules/scheduled-trigger/
- Platform quotas and limits (includes trigger and function budgets): https://developer.atlassian.com/platform/forge/platform-quotas-and-limits/
- Storage API (KV Store): https://developer.atlassian.com/platform/forge/runtime-reference/storage-api-basic/
- Custom Entities: https://developer.atlassian.com/platform/forge/runtime-reference/custom-entities/

Last verified: 2025-08-08
