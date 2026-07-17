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
