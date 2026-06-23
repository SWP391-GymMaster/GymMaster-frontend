## 1. Source Contract Inventory

- [/] 1.1 Collect latest backend Swagger/OpenAPI/Postman/Bruno route contract for all MVP APIs. Repo-local docs checked; configured backend base was probed, but public Swagger/OpenAPI discovery returned `404`; still blocked on official backend docs/route list or enabled docs endpoint.
- [x] 1.2 Build a route coverage table comparing `AGENTS.md`, `docs/design/08_ROUTE_MAP_NAVIGATION.md`, and `src/app/**/page.tsx`.
- [x] 1.3 Build an endpoint coverage table from `src/features/**/api/*.ts` and compare it with backend contract paths, methods, payloads, response shapes, and error codes.
- [x] 1.4 Build an MSW coverage table from `src/mocks/handlers/*.ts` and flag mock-only behavior without backend documentation.
- [x] 1.5 Confirm whether `openspec/` artifacts should remain local-only or be tracked for team review.

## 2. P0 Verification

- [/] 2.1 Verify Google OAuth backend configuration and `/api/v1/auth/google` payload/response contract with a real Google ID token. Dummy-token probe confirms `GOOGLE_NOT_CONFIGURED`; real token retest is blocked until backend Google config exists.
- [/] 2.2 Verify server-side RBAC for admin-only, staff-only, PT assigned-only, and member self-only access against live backend. Blocked on valid live role accounts/tokens; repo mock credentials are invalid on live backend.
- [/] 2.3 Verify expired access-token behavior across multiple feature API calls and document whether global 401 refresh is required. Blocked on valid live tokens/refresh tokens; repo review found no global 401 refresh in `apiRequest`.
- [x] 2.4 Confirm backend response envelope and error shape are compatible with `src/lib/api/http-client.ts`. Live invalid auth uses JSON envelopes; protected empty `401` responses were incompatible and are being mitigated in `handle-empty-protected-api-errors`.

## 3. MVP Flow Audit

- [ ] 3.1 Audit Staff sell package -> record payment -> active membership -> check-in against live backend and docs.
- [ ] 3.2 Audit renewal flow for contiguous end dates, pending payment behavior, duplicate payment handling, and audit logging.
- [ ] 3.3 Audit check-in edge cases for active, expired, locked, pending-payment, and not-found members.
- [ ] 3.4 Audit Admin PT assignment candidate endpoints and duplicate active assignment error `ALREADY_ASSIGNED`.
- [ ] 3.5 Audit PT assigned member list, Member 360, workout plan, trainer note, and progress access constraints.
- [ ] 3.6 Audit Member meal journal, calorie summary, calorie history, and custom food flow against backend DTOs.
- [ ] 3.7 Audit Admin dashboard and audit log data deltas after real mutations.

## 4. Route, UX State, and Test Coverage Audit

- [x] 4.1 Classify missing or staged routes by MVP, secondary, future, or intentionally out of scope.
- [ ] 4.2 Audit loading, error, empty, success, and permission-denied states for P0/P1 flows.
- [/] 4.3 Compare current Vitest/Playwright coverage with required flows in `AGENTS.md`, `docs/init/09_TEST_PLAN.md`, and `docs/design/13_PLAYWRIGHT_E2E_PLAN.md`. Targeted backend-contract drift was fixed and rerun green; full coverage comparison remains open.
- [ ] 4.4 Separate mock/MSW-passing tests from live-backend integration checks in the final report.

## 5. Secondary and Consistency Audit

- [x] 5.1 Audit nutrition online search and barcode lookup against backend proxy/cache contract and remove ambiguity around direct external API fallback.
- [ ] 5.2 Audit notification API usage and decide whether notification behavior is MVP demo scope or secondary-only.
- [ ] 5.3 Audit design-rule drift such as non-Lucide icons, mixed runtime language, and inconsistent status/error presentation.
- [ ] 5.4 Audit environment documentation gaps including Google and API base URL setup without exposing secrets.

## 6. Review and Follow-up Planning

- [x] 6.1 Update `audit-matrix.md` with verified evidence from source contract inventory and live API checks.
- [/] 6.2 Split approved P0/P1 fixes into separate scoped OpenSpec changes before implementation. First scoped fix created as `handle-empty-protected-api-errors`; remaining P0/P1 fixes still need owner/backend inputs.
- [ ] 6.3 Define targeted checks for each approved fix, then broader `npm run typecheck`, `npm run lint`, `npm run test`, and relevant Playwright flows.
- [ ] 6.4 Archive this audit change only after owner accepts the final audit report and follow-up backlog.
