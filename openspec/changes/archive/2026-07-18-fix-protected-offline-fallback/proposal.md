## Why

The production-mode PWA suite consistently renders the unauthenticated `PermissionGuard` state instead of the branded offline document when an already controlled page navigates to `/member/dashboard` under Playwright offline emulation. The service-worker unit contract passes, so the browser-level failure must be isolated as either a real controlled-navigation defect or a test-emulation defect without weakening cache privacy or authentication.

## What Changes

- Reproduce the protected offline navigation with observable service-worker control, fetch handling, response URL/content type, navigation mode, browser cache state, and auth-guard outcome before changing implementation.
- Decide from evidence whether the defect belongs to the service-worker navigation path or the Playwright offline harness, then change only the smallest responsible layer.
- Require a controlled failed document navigation to return `public/offline.html` with its Vietnamese heading and retry action, while an already-open page continues to show the accessible connectivity notice.
- Preserve network-only behavior for APIs, mutations, RSC/router-prefetch traffic, authentication, member documents, and all other protected data; do not cache a protected route as an offline substitute.
- Add deterministic browser regression coverage that distinguishes the offline document from an online unauthenticated permission response and still proves cache privacy.
- Keep this correction independent from Gate C and from login Lighthouse acceptance, with staging, commit, push, and deployment requiring owner review of the completed diff.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `progressive-web-app`: Clarifies and verifies that a browser-controlled protected document navigation which genuinely fails at the network boundary receives the branded offline document rather than rendering an online auth-guard response.

## Impact

- Expected investigation surface: `public/sw.js`, `public/offline.html`, `src/tests/e2e-pwa/pwa.spec.ts`, `playwright.pwa.config.ts`, and existing service-worker tests.
- `PermissionGuard`, auth/session contracts, role routing, APIs, protected caching rules, and application data remain behaviorally unchanged unless evidence proves a separate defect and the owner approves an expanded scope.
- No new dependency is planned.
