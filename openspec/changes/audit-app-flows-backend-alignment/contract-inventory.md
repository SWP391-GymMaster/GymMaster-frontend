# Contract Inventory - P0/P1 Audit Pass

> Status: Updated from repo inventory plus sanitized live backend probes. Secrets, token values, and env values were not printed or stored.

## 1. Evidence Sources Checked

| Source | Status | Notes |
|---|---|---|
| `AGENTS.md` | Checked | Strict auth/navigation, route, RBAC, UI state, testing, and OpenSpec rules are current source of truth. |
| `docs/init/04_REQUIREMENTS.md` | Checked | Defines required auth, membership/payment, check-in, PT/RBAC, meal, dashboard, and audit behavior. |
| `docs/init/03_SRS_USE_CASES.md` / `06_FEATURE_SPECS.md` / `09_TEST_PLAN.md` | Checked | Confirms key demo flows and negative cases such as duplicate payment 409, PT duplicate assignment 422, unassigned PT 403. |
| `docs/backend/online-food-search-integration.md` | Checked | Concrete backend contract exists for nutrition online/barcode only. |
| `src/features/**/api/*.ts` | Checked | Feature clients define most current endpoint assumptions. |
| `src/mocks/handlers/*.ts` | Checked | MSW covers many backend contracts, but this remains mock-only evidence. |
| `src/tests/**` | Checked | Strong Vitest/Playwright coverage exists for mock/MSW flows. |
| Live backend via configured API base | Partially checked | Backend is reachable for auth/protected safe probes. Public Swagger/OpenAPI discovery returned `404` at common paths. No valid seed credentials were available for ownership/RBAC flow verification. |
| `live-backend-probe.md` | Checked | Sanitized probe log from configured backend base; no host, secret, token, or env value stored. |
| Targeted Vitest | Checked | Initial run exposed mock ID drift; after normalization, targeted contract and nearby flow tests pass. |

## 2. Route Coverage Snapshot

| Area | Source-of-truth route | Current page | Status |
|---|---|---|---|
| Auth | `/login`, `/welcome` | Present | Covered |
| Admin | `/admin/dashboard`, `/admin/users`, `/admin/staff`, `/admin/members`, `/admin/members/[id]`, `/admin/trainers`, `/admin/packages`, `/admin/memberships`, `/admin/payments`, `/admin/assignments`, `/admin/audit-logs`, `/admin/notifications` | Present | Covered |
| Admin | `/admin/audit-logs/[id]` | Missing | Gap from `AGENTS.md`; not in older design route map. |
| Staff | `/staff/dashboard`, `/staff/members`, `/staff/members/[id]`, `/staff/sell-package`, `/staff/renew-package`, `/staff/check-in`, `/staff/payments` | Present | Covered |
| PT | `/pt/dashboard`, `/pt/members`, `/pt/members/[id]`, `/pt/members/[id]/workout`, `/pt/members/[id]/notes`, `/pt/members/[id]/progress` | Present | Covered |
| PT | `/pt/members/[id]/nutrition` | Missing | Gap from `AGENTS.md`; route may be staged or intentionally deferred. |
| Member | `/member/dashboard`, `/member/membership`, `/member/workout`, `/member/notes`, `/member/progress`, `/member/nutrition/meal-journal`, `/member/nutrition/summary` | Present | Covered |
| Member | `/member/check-in`, `/member/nutrition`, `/member/nutrition/food-search`, `/member/profile` | Missing | Gap from `AGENTS.md` and/or design route map. |

## 3. Endpoint Coverage Snapshot

| Flow | Frontend endpoint assumptions | MSW coverage | Concrete backend docs | Live probe result |
|---|---|---|---|---|
| Auth login | `POST /api/v1/auth/login` | Yes | Product docs only | Invalid login returned JSON envelope with `INVALID_CREDENTIALS`. Demo/mock account credentials did not authenticate against live backend. |
| Google OAuth | `POST /api/v1/auth/google` with `{ idToken }` | Yes | Product docs only | Dummy token returned JSON envelope with `GOOGLE_NOT_CONFIGURED`; backend config blocker remains. |
| Auth me | `GET /api/v1/auth/me` | Yes | Product docs only | No-token probe returned `401` body empty. |
| Refresh/logout | `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` | Yes | Product docs only | Not live-verified without valid refresh token. |
| Member management | `/api/v1/members`, `/api/v1/users`, `/api/v1/trainers` | Yes | Product docs only | Protected endpoints returned `401` body empty with no/fake token. |
| Membership/payment | `/api/v1/packages`, `/api/v1/memberships`, `/api/v1/memberships/sell`, `/api/v1/memberships/:id/payment`, `/api/v1/memberships/:id/renew`, `/api/v1/payments` | Yes | Product docs only | Protected GETs returned `401` body empty with no/fake token; mutation flow not live-verified. |
| Check-in | `/api/v1/checkins`, `/api/v1/members/:id/checkins` | Yes | Product docs only | Protected GET returned `401` body empty with no/fake token; mutation flow not live-verified. |
| PT assignment/training | `/api/v1/assignments/**`, `/api/v1/pt/members`, `/api/v1/members/:id/workout-plans`, `/api/v1/members/:id/notes`, `/api/v1/members/me/**` | Yes | Product docs only | Protected GETs returned `401` body empty with no/fake token; ownership cannot be verified without valid role accounts. |
| Member 360 | `/api/v1/members/:id/profile-360` | Yes, plus alias `/360` | Product docs only | Protected GET returned `401` body empty with no/fake token. |
| Progress | `/api/v1/members/:id/progress` | Yes | Product docs only | Protected GET returned `401` body empty with no/fake token. |
| Nutrition local | `/api/v1/food-items`, `/api/v1/meal-logs`, `/api/v1/members/:id/calorie-*` | Yes | Product docs plus online/barcode docs | Protected local food endpoint returned `401` body empty with no/fake token. |
| Nutrition online/barcode | `/api/v1/food-items/online-search`, `/api/v1/food-items/barcode/:barcode` | Yes | `docs/backend/online-food-search-integration.md` uses `/api/food-items/...` contract text | Live `/api/v1/food-items/online-search`, `/api/v1/food-items/barcode/:barcode`, and docs-style `/api/food-items/...` paths returned `404` body empty; route not exposed at configured base. |
| Dashboard/audit | `/api/v1/dashboard/summary`, `/api/v1/audit-logs` | Yes | Product docs only | Protected GETs returned `401` body empty with no/fake token. |
| Notifications | `/api/v1/notifications?role=...` and mutations | Yes | Product marks secondary | Protected GET returned `401` body empty with no/fake token; role query remains a contract/security concern. |

## 4. Live Backend Findings

| Finding | Evidence | Impact |
|---|---|---|
| Backend is partially reachable | Invalid `POST /api/v1/auth/login` returned `401`, `success=false`, `INVALID_CREDENTIALS`. | Auth route exists and response envelope works for invalid login. |
| Swagger/OpenAPI is not publicly exposed at configured base | Common paths including `/swagger/v1/swagger.json`, `/swagger/index.html`, `/openapi.json`, `/api-docs`, `/docs`, `/redoc`, and `/scalar` returned `404`. | Cannot auto-import official backend contract from the current base URL; route list or docs must come from backend team/repo or an enabled docs endpoint. |
| Google OAuth backend config is missing | `POST /api/v1/auth/google` with dummy token returned `500`, `success=false`, `GOOGLE_NOT_CONFIGURED`. | Confirms Google login blocker is backend/config, unless backend expects a different field than `{ idToken }`. |
| Protected endpoints return empty 401 body | Many protected GETs returned `401` with empty body for no/fake token. | Frontend mitigation in `handle-empty-protected-api-errors` normalizes empty `401/403` responses in `src/lib/api/http-client.ts`; backend JSON envelopes are still recommended to preserve request metadata. |
| Demo/mock credentials are not valid on live backend | `admin/staff/pt/member@gymmaster.local` with repo test password all returned `INVALID_CREDENTIALS`. | Cannot verify live RBAC, ownership, or mutation workflows without real seed accounts/token. |
| Nutrition online proxy route is not exposed | Live v1 and docs-style online/barcode paths returned `404`. | FE endpoint versioning and backend proxy path need alignment before nutrition online/barcode can be trusted. |
| MSW backend-contract tests had mock ID drift | Initial targeted Vitest run: `http-client.test.ts` passed, `backend-contract-handlers.test.ts` failed 4 tests. The failure came from `GM-101` using member profile id `4` while related membership/payment/assignment/nutrition/progress records use `memberId: 101`. This was normalized in the mock data and member test session. | The MSW contract test baseline is now usable again as a local regression gate. |

## 5. Immediate Backend Inputs Needed

- Latest Swagger/OpenAPI or route list for all `/api/v1` endpoints, because public docs discovery returned `404` at the configured base.
- Valid demo seed accounts or a short-lived test token set for Admin, Staff, PT, and Member.
- Confirmation whether protected 401/403 responses should use the same JSON envelope as auth errors, even though the frontend now has an empty-body fallback.
- Confirmation whether nutrition online/barcode routes are `/api/v1/food-items/...` or `/api/food-items/...`.
- Confirmation whether Google OAuth backend config uses `Google:ClientId`, `Authentication:Google:ClientId`, or another key name.

## 6. Local Test Findings

| Command | Result | Notes |
|---|---|---|
| `npm run test -- --run src/tests/api/http-client.test.ts src/tests/mocks/backend-contract-handlers.test.ts` | Passed after fix | 2 files passed, 18 tests passed. Initial failure was fixed by normalizing member profile id `101` in mock data/auth session test setup. |
| `npm run test -- --run src/tests/staff-front-desk/member-search.test.tsx src/tests/staff-front-desk/member-detail.test.tsx src/tests/staff-front-desk/check-in-terminal.test.tsx src/tests/member-nutrition/calorie-summary-workspace.test.tsx src/tests/member-nutrition/meal-log-form.test.tsx src/tests/member-360/member-360-content.test.tsx src/tests/member-progress-tracking/progress-log-form.test.tsx` | Passed | 7 files passed, 19 tests passed. |

Initial failing MSW contract cases fixed:

| Test area | Failure | Likely cause |
|---|---|---|
| Sell membership pending payment | Expected `201`, received `404`. | Fixed by using member profile id `101` for `GM-101`. |
| Record membership payment | Sale setup returned no membership, then payment test failed on null membership. | Fixed by same member profile id normalization. |
| Duplicate PT assignment | Expected `422 ALREADY_ASSIGNED`, received `404`. | Fixed by same member profile id normalization. |
| Member profile-360/progress contract | Expected profile `200`, received `404`. | Fixed by same member profile id normalization. |
