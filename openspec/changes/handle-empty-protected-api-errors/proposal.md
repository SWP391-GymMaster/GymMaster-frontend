## Why

Live backend probes from the app-flow audit showed many protected endpoints returning `401` with an empty body. The current frontend API client tries to parse JSON for every non-204 response, so empty protected errors become `INVALID_RESPONSE` instead of a useful auth/permission error.

This affects all protected flows because the user may see a generic invalid-response failure instead of session-expired or permission-denied handling.

## What Changes

- Normalize empty `401 Unauthorized` responses to an `ApiClientError` with code `UNAUTHORIZED`.
- Normalize empty `403 Forbidden` responses to an `ApiClientError` with code `FORBIDDEN`.
- Preserve existing JSON envelope parsing for backend responses that do include `{ success, data, error, meta }`.
- Keep `204 No Content` behavior unchanged.
- Add unit tests for empty `401`, empty `403`, invalid non-auth JSON parsing, and normal response behavior.
- Do not implement global token attach or global refresh in this change.

## Capabilities

### New Capabilities

- `protected-api-error-normalization`: Frontend API client can handle protected backend errors even when the backend returns an empty `401` or `403` body.

### Modified Capabilities

- None.

## Impact

- Affected runtime code:
  - `src/lib/api/http-client.ts`
- Affected tests:
  - `src/tests/api/http-client.test.ts`
- Affected tooling:
  - `eslint.config.mjs` ignores local generated analysis artifacts so lint checks repository source instead of `.understand-anything/.trash`.
- Related audit artifacts:
  - `openspec/changes/audit-app-flows-backend-alignment/audit-matrix.md`
  - `openspec/changes/audit-app-flows-backend-alignment/contract-inventory.md`
  - `openspec/changes/audit-app-flows-backend-alignment/tasks.md`
- No backend, route, dependency, or session storage change is included.
