## 1. API Error Normalization

- [x] 1.1 Add empty `401` and `403` fallback normalization in the shared API client.
- [x] 1.2 Preserve existing structured JSON envelope and `204` behavior.

## 2. Tests

- [x] 2.1 Add unit tests for empty `401`, empty `403`, structured backend errors, non-protected invalid responses, and normal success parsing.

## 3. Audit Tracking

- [x] 3.1 Update the app-flow/backend-alignment audit artifacts to record the frontend mitigation and remaining backend envelope recommendation.

## 4. Verification

- [x] 4.1 Run OpenSpec validation for the new change.
- [x] 4.2 Run targeted unit tests and typecheck.
- [x] 4.3 Ignore local generated analysis artifacts in ESLint config so lint verifies repository source.
