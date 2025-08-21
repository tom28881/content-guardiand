# Appendix B — Scopes and Manifest Permissions

## Overview
Forge apps declare permissions in the `manifest.yml` under `permissions`. The most important are:
- `scopes`: product and platform privileges your app requests (granted by a site admin)
- `external`: egress allowlist for outbound HTTP(S) calls from Forge functions

Scopes are least-privilege and consent-driven. Missing or incorrect scopes cause API calls to fail.

## Key facts and requirements (summary)
- Scopes are additive and granted by admins at install/upgrade. Adding scopes requires a new version and re-consent.
- Product scopes are specific to each product (e.g., Confluence content scopes). Platform scopes are product-agnostic (e.g., `storage:app`).
- The principal used to call an API matters:
  - `asUser()`: requires that the end user has access and that the app has the scope
  - `asApp()`: uses the app’s own identity with the app’s scopes
- Egress (outbound HTTP) requires explicit allowlisting in `permissions.external.fetch`.
- Follow least privilege. Request only what’s required by features.

### Example manifest snippet
```yaml
permissions:
  scopes:
    - storage:app
    - read:confluence-content.summary
    - write:confluence-content
  external:
    fetch:
      backend:
        - https://api.example.com
```

## Implementation notes and best practices
- Map every REST/GraphQL call to a specific required scope and document the rationale.
- Prefer `asUser()` for actions on behalf of a user; use `asApp()` for background or cross-user operations where appropriate.
- Keep the egress allowlist minimal and environment-aware; avoid wildcards.
- When adding scopes, communicate the change clearly to admins to avoid blocked upgrades.

## Current app scopes in this repository
- Manifest scopes: `storage:app`, `read:confluence-content.summary`, `read:confluence-space.summary`, `write:confluence-content`
- External egress: none
- Scheduled triggers: do not require additional scopes; they run with the same function permissions as declared in the manifest.
- Note: Adding `write:confluence-content` enables real actions (archive pages via Confluence API v2, add labels, set content properties). Admin re-consent is required after this change.

## References (official)
- Manifest permissions and scopes: https://developer.atlassian.com/platform/forge/manifest-reference/permissions/
- Confluence scopes for OAuth 2.0 (3LO) and Forge apps: https://developer.atlassian.com/cloud/confluence/scopes-for-oauth-2-3LO-and-forge-apps/

Last verified: 2025-08-08
