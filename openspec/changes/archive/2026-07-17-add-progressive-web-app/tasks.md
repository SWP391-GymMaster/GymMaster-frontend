## 1. Baseline and branded assets

- [x] 1.1 Record the pre-change `typecheck`, `lint`, unit-test, production-build, and relevant Playwright baseline without modifying unrelated failures.
- [x] 1.2 Generate GymMaster 192x192, 512x512, and 512x512 maskable PNG icons from the approved repo-local brand mark; verify dimensions, transparency/background, safe zone, and visual quality.
- [x] 1.3 Define the PWA release/cache version and document the exact public-static allowlist and protected-request exclusions used by implementation tests.

## 2. Manifest and offline document

- [x] 2.1 Add `src/app/manifest.ts` with GymMaster metadata, `/` start URL, root scope, standalone display, semantic theme/background colors, and validated icon entries.
- [x] 2.2 Add an accessible, self-contained Vietnamese `public/offline.html` with GymMaster branding, connectivity explanation, and retry action, without protected or user-specific content.
- [x] 2.3 Add focused manifest/offline contract tests that verify required fields, referenced asset responses, copy, and accessibility semantics.

## 3. Service worker and cache safety

- [x] 3.1 Implement `public/sw.js` with versioned `gymmaster-pwa-*` caches, offline-document/icon precaching, strict same-origin static allowlisting, network-first document fallback, and cleanup of obsolete PWA caches.
- [x] 3.2 Implement update messaging (`SKIP_WAITING`) and guarantee that non-GET, API, auth/protected, RSC/prefetch, user-specific, and cross-origin requests bypass Cache Storage.
- [x] 3.3 Add `/sw.js` content type, no-cache, CSP, and MIME-sniffing headers in `next.config.ts` without broadening the change to global security headers.
- [x] 3.4 Add Vitest service-worker contract tests with controlled worker globals for install/activate/fetch/message behavior, cache cleanup, offline fallback, and protected-request exclusions.

## 4. PWA lifecycle and MSW coexistence

- [x] 4.1 Add a reusable client PWA lifecycle component that registers `/sw.js` only for supported production clients when API mocking is disabled.
- [x] 4.2 Update `src/app/providers.tsx` so mock-enabled startup unregisters only stale `/sw.js` GymMaster PWA registrations, clears only `gymmaster-pwa-*` caches, and then starts `mockServiceWorker.js`.
- [x] 4.3 Add a user-controlled Vietnamese update notice through the existing Sonner setup; activate/reload once only after confirmation and keep deferred clients usable.
- [x] 4.4 Add lifecycle tests covering unsupported browsers, first registration, waiting updates, one-time reload, deferral, and PWA/MSW mutual exclusion.

## 5. Install and connectivity experience

- [x] 5.1 Add an accessible reusable install action that captures `beforeinstallprompt`, detects standalone/iOS state, provides Vietnamese iOS guidance, and persists dismissal for the current PWA release.
- [x] 5.2 Integrate the shared install action into `AccountProfileWorkspace` for Admin/Staff/PT and `MemberSelfProfilePage` for Member without changing profile permissions or unrelated layout behavior.
- [x] 5.3 Add a non-blocking global Vietnamese connectivity notice, remove the simulated Water Tracker offline queue/success flow, clear its legacy storage key, and preserve honest device-local water logging without queued backend writes.
- [x] 5.4 Add responsive, keyboard, standalone, eligibility, dismissal, iOS-guidance, and connectivity-state component tests.

## 6. Production verification and handoff

- [x] 6.1 Add a focused Playwright PWA suite against `npm run build` plus `npm run start` to verify manifest/icons, worker headers/control, offline document navigation, install/update affordances where deterministic, and cache privacy exclusions.
- [x] 6.2 Run `npm run typecheck`, `npm run lint`, `npm run test -- --run`, `npm run build`, and the production PWA Playwright suite; record every pass, failure, or unrelated baseline issue.
- [x] 6.3 Complete manual Chromium Application/Lighthouse and iOS Add to Home Screen checklists, including installed launch, standalone detection, one update cycle, offline retry, MSW development startup, and Cache Storage inspection.
- [x] 6.4 Run strict OpenSpec validation and `graphify update .`, review the final staged diff with the owner, and do not commit, push, or archive until separately approved.
- [x] 6.5 After implementation acceptance, archive `add-progressive-web-app` through OpenSpec and re-run strict validation of the archived package.
