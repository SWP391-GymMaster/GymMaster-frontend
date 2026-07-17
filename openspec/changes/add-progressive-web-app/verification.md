# Verification Record

## Pre-change baseline (2026-07-17)

| Check | Result | Notes |
|---|---|---|
| `npm run typecheck` | Passed | No TypeScript errors. |
| `npm run lint` | Passed with baseline warnings | 0 errors, 33 pre-existing warnings outside the PWA scope. |
| `npm run test -- --run --reporter=dot` | Passed | 50 files, 226 tests. Expected test stderr remained in camera-denial and zero-sized chart cases. |
| `npm run build` | Passed | Next.js 16.2.6 production build; 44 routes generated. |
| `npx playwright test src/tests/e2e/smoke.spec.ts` | Passed | 1 Chromium smoke test. Existing warning: `next start` with `output: standalone` recommends `.next/standalone/server.js`. |

This baseline was captured before PWA source changes. Existing lint warnings and the standalone-server warning are not attributed to this change.

## Approved implementation policy

- PWA release: `2026.07.17.1`
- Cache namespace: `gymmaster-pwa-`
- Static cache: `gymmaster-pwa-static-v1`
- Install precache: `/offline.html`, `/icons/gymmaster-192.png`, `/icons/gymmaster-512.png`, `/icons/gymmaster-maskable-512.png`
- Runtime cache allowlist: same-origin `/_next/static/`, `/assets/gymmaster/gymmaster-mark.svg`, and `/assets/gymmaster/gymmaster-wordmark.svg`
- Always bypass: non-GET requests, cross-origin requests, `/api` routes, document responses, RSC/Next Router prefetch requests, authentication/business APIs, and every resource outside the allowlist
- Cache admission: successful allowlisted responses only; protected responses and mutations are never written to Cache Storage
- Update policy: a waiting worker activates only after explicit user confirmation

The maskable icon keeps the shield/barbell within the central safe zone on a full Iron background. Generated PNG metadata was verified at 192x192 and 512x512, and both regular/maskable 512px assets were inspected visually.

## Post-change verification

### Interim audit (2026-07-17)

- PWA manifest/offline contracts: 4 tests passed.
- Service-worker cache/privacy/header contracts: 11 tests passed.
- Lifecycle, MSW isolation, install UI, connectivity, provider, and profile regression selection: 24 tests passed.
- Post-audit lifecycle/install/provider selection: 13 tests passed after adding feature detection and failure-tolerant PWA cleanup.
- Targeted TypeScript checks passed.
- Targeted ESLint checks passed with no warnings.
- Owner decision: remove the existing `useOfflineSync`/`WaterTrackerCard` simulated queue and success toast, retain honest device-local water history, and clear the obsolete queue key. Approved on 2026-07-17 before continuing task 5.3.
- Simulated queue cleanup: 15 targeted tests passed; no runtime queue/synthetic-success references remain; targeted typecheck and lint passed.
- Account/Member profile install integration: 12 selected tests passed.
- Production PWA Playwright: 3/3 Chromium tests passed for manifest/icons/headers, worker registration/cache privacy, connectivity state, and offline navigation.
- Browser audit correction: document navigation now uses network `no-store` so protected HTML cannot be revived from the browser HTTP cache while offline; the corresponding unit and Chromium tests pass.
- Full post-change typecheck passed.
- Full post-change lint completed with 0 errors and the same 33 pre-existing warnings captured in the baseline; no PWA warning was introduced.
- Full post-change Vitest passed: 56 files, 257 tests.
- Latest production build passed as part of the production PWA Playwright server startup.
- Browser MSW regression passed: login page waited for `__GYMMASTER_MSW_READY__` and preserved the no-role-picker contract.
- Known non-blocking baseline warning remains: `next start` warns that `output: standalone` deployments should use `.next/standalone/server.js`; both standard and PWA browser suites start successfully.

### Physical-device and Lighthouse acceptance (2026-07-17)

- Owner verified actual installation behavior on Chrome, Edge, iOS, and Android and accepted the installed experience as appropriate.
- Lighthouse 13.4.0 ran against `http://127.0.0.1:3101/login` from a local production-mode build with mobile emulation.
- Lighthouse report validity: no runtime error and no run warning. JSON and HTML reports were written to the local temporary directory and were intentionally not added to the repository.
- Scores: Performance 67, Accessibility 96, Best Practices 100, SEO 100.
- Metrics: First Contentful Paint 1.7 s, Largest Contentful Paint 7.8 s, Total Blocking Time 350 ms, Cumulative Layout Shift 0, Speed Index 1.7 s.
- Primary performance findings: the 763 KB login cover PNG has an estimated 575 KB saving opportunity, render-blocking CSS has an estimated 940 ms saving opportunity, and unused JavaScript has an estimated 173 KB saving opportunity.
- Accessibility finding: the `GymMaster OS` link and primary login button fail AA contrast in the audited state (reported ratios 3.16:1 and 3.59:1 versus the required 4.5:1).
- The back/forward-cache finding was reported as non-actionable because a service worker was unregistered during the audit lifecycle.
- Lighthouse 13 no longer includes a PWA category. PWA-specific acceptance is supplied by the production Playwright suite, service-worker/component tests, Chromium Application inspection, and physical-device checks.
- Lighthouse CLI exited non-zero only when Windows denied deletion of its temporary Chrome profile (`EPERM`) after both reports were successfully written; this is recorded as a local tool cleanup issue rather than an application failure.

The performance and contrast findings should be handled through a focused login quality follow-up rather than broadening the approved PWA cache/lifecycle change.

### Owner staged-diff review (2026-07-17)

- Strict OpenSpec validation and the post-implementation incremental Graphify update completed successfully before handoff.
- The final PWA/OpenSpec staged diff was presented separately from pre-existing/generated `graphify-out/` changes.
- The owner approved the recommended staged PWA diff on 2026-07-17.
- No commit, push, or OpenSpec archive was performed as part of this approval; each remains a separate explicit action.
