## 1. Baseline and guardrails

- [x] 1.1 Preserve the 2026-07-17 production Lighthouse 13.4.0 baseline (Performance 61, Accessibility 96, LCP 8.6 s, TBT 210 ms, CLS 0.072), capture representative 412x823 and desktop login screenshots, and record the PNG/WebP and Google-resource network evidence used for comparison.
- [x] 1.2 Run the focused pre-change auth component and Playwright login tests and record any unrelated baseline failure before editing implementation files.
- [x] 1.3 Confirm the implementation diff excludes auth-session contracts, redirect maps, backend/API code, manifest/service-worker/offline files, and new dependencies.

## 2. Responsive auth shell and critical render

- [x] 2.1 Add a dedicated auth operations-cover asset reference that reuses the existing optimized WebP without changing member dashboard asset behavior.
- [x] 2.2 Update `AuthOSShell` and its route-scoped styling so mobile renders the brand gradient without requesting the raster cover and desktop uses the optimized cover under the readability gradient.
- [x] 2.3 Remove the unnecessary auth-shell client boundary while keeping `LoginForm` and other interactive auth forms client-owned; ensure critical headings, descriptions, fields, and actions have no delayed or transparent initial state.
- [x] 2.4 Visually verify login, signup, forgot-password, reset-password, and change-password at mobile and desktop breakpoints, including image-failure fallback and reduced-motion behavior.

## 3. Accessible auth actions

- [x] 3.1 Define centralized auth-scoped link/action colors and apply them to the GymMaster OS link, auth text links, primary login button, and relevant hover/disabled/focus states without changing global role-workspace theme tokens.
- [x] 3.2 Verify computed WCAG 2.2 AA contrast: at least 4.5:1 for normal text and 3:1 for meaningful non-text boundaries/focus indicators, with visible keyboard focus throughout the login form.
- [x] 3.3 Add focused regression assertions for accessible names, keyboard order, loading/error semantics, and the absence of role-selection controls.

## 4. Deferred Google Identity Services

- [x] 4.1 Replace immediate manual Google script injection with the approved deferred Next.js lifecycle and initialize the real provider at most once after the critical login UI is interactive or idle.
- [x] 4.2 Render a dimensionally stable accessible loading region, official ready control, and safe Vietnamese failure state without blocking email/password login.
- [x] 4.3 Preserve mock token submission, missing-client-ID behavior, backend-role redirect, pending/error feedback, and zero Google network requests in mock/test or unconfigured mode.
- [x] 4.4 Add component tests for deferred loading, successful one-time initialization, rerender/revisit idempotence, failure handling, stable region semantics, and unchanged mock behavior.

## 5. Browser and contract verification

- [x] 5.1 Extend focused Playwright coverage to assert that mobile login does not request the raster cover, desktop receives an optimized cover no larger than 150 KB, and critical content is visible before deferred Google readiness.
- [x] 5.2 Run the existing email/password and mock Google flows for all four backend-role redirects, invalid credentials, missing role, and no-role-picker behavior.
- [x] 5.3 Run production-build responsive smoke checks for every route importing `AuthOSShell` and inspect layout shift, keyboard focus, image fallback, and provider failure behavior.
- [x] 5.4 Inspect the active PWA cache after exercising login and confirm no Google resource, auth/API response, or protected-route document was introduced.

## 6. Quality gates, approval, and production acceptance

- [x] 6.1 Run `npm run typecheck`, `npm run lint`, `npm run test -- --run`, `npm run build`, and the relevant production-mode Playwright tests; report every pass, failure, or unrelated baseline issue.
- [x] 6.2 Run `openspec validate "improve-login-lighthouse-quality" --strict` and `graphify update .`, then verify that only intended graph changes and login-quality files are present.
- [x] 6.3 Review the complete diff and visual/network evidence, stage only the approved change files, and wait for the owner's explicit approval before commit or push.
- [ ] 6.4 After the separately approved production deployment, run three valid Lighthouse 13.4.0 mobile audits against the same `/login` revision and verify median Performance at least 85, median LCP at most 2.5 s, median TBT at most 200 ms, worst CLS at most 0.1, Accessibility 100 in every run, and no contrast failure.
- [ ] 6.5 Present the production reports and final PWA/auth regression evidence to the owner; archive the OpenSpec change only after explicit acceptance.

## 7. Production LCP follow-up

- [x] 7.1 Record the first production acceptance result: median Performance 89, median LCP 3.402 s, median TBT 109 ms, worst CLS 0.049, Accessibility 100 in every run, and no contrast failure; retain the failed LCP gate and the Vietnamese text/font-loading evidence.
- [x] 7.2 Configure Inter to preload its Latin and Vietnamese subsets and disable Geist Mono preload without changing font families, CSS variables, authentication, PWA, routes, copy, or Google Identity Services behavior.
- [x] 7.3 Build the production app and inspect generated `/login` markup and font CSS to confirm an Inter Vietnamese preload is present, a Geist Mono preload is absent, and fonts remain available through the existing variables.
- [x] 7.4 Run typecheck, lint, focused auth/PWA regression tests, and three comparable local production Lighthouse audits; record all results and keep `display: "optional"` outside this pass.
- [x] 7.5 Run strict OpenSpec validation and `graphify update .`, then present the complete unstaged diff and evidence to the owner without staging, committing, or pushing.

## 8. Local-only Inter optional-display experiment

- [x] 8.1 Record owner approval, the three-run local baseline, the 10 percent minimum LCP improvement rule, the existing quality budgets, the normal/delayed-font visual gate, and the automatic revert conditions.
- [x] 8.2 Set Inter to `display: "optional"` while retaining the approved Latin/Vietnamese subsets and disabled Geist Mono preload; do not change auth, PWA, routes, copy, layout classes, Google Identity Services, or dependencies.
- [x] 8.3 Build with production settings and confirm generated CSS uses `font-display: optional`, `/login` still preloads only Inter Latin/Vietnamese, and Geist Mono remains available without a preload.
- [x] 8.4 Capture and inspect mobile and desktop `/login` screenshots under normal font delivery and deliberately delayed font delivery; verify readable Vietnamese copy, stable hierarchy/wrapping, complete controls, and no overflow.
- [x] 8.5 Run typecheck, lint, focused auth/PWA regressions, and three valid local Lighthouse 13.4.0 mobile audits against the same production build.
- [x] 8.6 Compare the optional-display medians with the 3.792-second LCP baseline and either retain the setting only when every documented criterion passes or revert it before owner review; record the decision and evidence.
- [x] 8.7 Run strict OpenSpec validation and `graphify update .`, inspect the complete unstaged diff, and present the experiment result without staging, committing, or pushing.

## 9. Evidence-ranked LCP remediation

- [x] 9.1 Record the three production reports' displayed and observed LCP values, common LCP node, TTFB/render-delay phases, render-blocking CSS estimates, initial JavaScript/unused-byte evidence, and the reasons to deprioritize backend, Google, fonts, and copy changes.
- [x] 9.2 Before editing, preserve a same-build three-run local Lighthouse baseline and the `/login` synchronous request graph, encoded JavaScript transfer, generated HTML size, and route bundle statistics.
- [x] 9.3 Implement Gate A by moving submit-only Zod/resolver execution behind the login submit boundary while retaining React Hook Form, the existing Zod schema, exact field messages, accessible pending/error states, and unchanged auth/session/redirect behavior.
- [x] 9.4 Add focused tests proving invalid email and empty password map to the existing fields/messages without an auth mutation, valid credentials use the unchanged login flow, and no Zod/resolver chunk is requested before interaction in a production build.
- [x] 9.5 Run typecheck, lint, focused auth/PWA tests, build, bundle/request inspection, and three comparable local mobile audits; retain Gate A only when initial encoded JavaScript drops by at least 40 KB, median LCP improves by at least 10 percent, and every existing quality/contract gate remains green.
- [x] 9.6 Record that Gate A passed its bundle/behavior boundaries but failed its LCP/Performance/TBT comparison, fully revert its application/test source, and keep `next.config.ts` unchanged.
- [x] 9.7 With owner approval limited to planning, revise the proposal, design, delta spec, and tasks so Gate B is independently approvable; run strict OpenSpec validation and present the proposal-only diff before any configuration edit.
- [x] 9.8 After separate owner approval of Gate B implementation, preserve the restored same-build HTML, stylesheet/request graph, total first-load transfer, three-run Lighthouse baseline, and representative route/PWA state; then add only `experimental.inlineCss: true` to the existing Next.js configuration and build locally.
- [x] 9.9 Inspect generated inline styles and encoded HTML/transfer; when the encoded HTML and first-load transfer hard gates fail, short-circuit downstream inline-build audits, automatically restore `next.config.ts`, rebuild the baseline state, and run final typecheck, lint, focused auth/PWA, worker/cache-privacy, and offline-fallback checks with every pass or baseline failure recorded.
- [x] 9.10 Run strict OpenSpec validation and `graphify update .`, inspect the complete unstaged result, and present all implementation and verification evidence before staging, committing, pushing, deploying, or repeating tasks 6.4 and 6.5.

## 10. Terminal disposition

- [x] 10.1 Record the approved Gate C no-edit feasibility result: conservative separable CSS was 5,641 gzip bytes and about 16.0% of first-party login stylesheet transfer, so both thresholds failed and no tracked runtime CSS/layout candidate was created.
- [x] 10.2 Record explicit owner approval to stop further login Lighthouse micro-experiments and archive this change as rejected with a known LCP gap; keep tasks 6.4 and 6.5 incomplete because production acceptance was not achieved, and do not sync the unaccepted delta into canonical specs.
