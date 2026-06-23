## Context

The app-flow/backend-alignment audit found that protected live backend endpoints often return `401` with an empty response body when no or invalid credentials are present. The frontend API client currently attempts to parse every non-204 response as the standard JSON envelope, so these protected failures surface as `INVALID_RESPONSE`.

The frontend already has domain error handling for `UNAUTHORIZED` and `FORBIDDEN` in several flows. The missing piece is a thin fallback in the shared API parser for empty protected responses.

## Goals / Non-Goals

**Goals:**

- Map empty `401` responses to `ApiClientError` code `UNAUTHORIZED`.
- Map empty `403` responses to `ApiClientError` code `FORBIDDEN`.
- Preserve existing JSON envelope behavior when the backend returns structured errors.
- Preserve `204 No Content` behavior.
- Add targeted unit coverage for the fallback behavior.

**Non-Goals:**

- Implement token attachment, token refresh, logout orchestration, or redirect behavior.
- Change backend contracts or mock endpoint data.
- Add dependencies or change API route paths.

## Decisions

- Keep the fallback in `src/lib/api/http-client.ts`, because all protected API calls pass through `parseApiResponse`.
  - Alternative considered: handle empty responses in each feature hook. This would duplicate auth/permission parsing and miss future endpoints.
- Only normalize empty/non-JSON `401` and `403` responses.
  - Alternative considered: synthesize fallback errors for all HTTP statuses. That could hide real backend contract issues that the audit still needs to track.
- Use Vietnamese fallback messages that are safe for user-facing surfaces.
  - Alternative considered: preserve backend request IDs. Empty responses do not provide them, so the fallback cannot synthesize a meaningful `requestId`.

## Risks / Trade-offs

- Empty `401/403` responses still lose backend `requestId` context -> Keep the audit recommendation that backend should return JSON envelopes for protected errors.
- A non-JSON `401/403` body with details would be treated the same as empty -> Acceptable because the current frontend contract expects JSON envelopes and should not parse ad hoc body formats.
- This does not solve global session expiry UX -> Keep global refresh/logout behavior as a separate follow-up from the audit matrix.

## Migration Plan

- Implement the parser fallback.
- Add unit tests around `parseApiResponse`.
- Update the audit artifacts to mark the frontend mitigation complete while leaving backend envelope consistency as a contract recommendation.
