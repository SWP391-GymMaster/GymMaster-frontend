## Why

GymMaster currently ships as a conventional Next.js web application: it has brand icon metadata and an MSW worker for mock APIs, but no web app manifest, application service worker, install flow, or defined offline behavior. Adding a deliberately constrained PWA foundation will improve installability and resilience without caching authenticated gym, membership, payment, or check-in data unsafely.

## What Changes

- Add an installable GymMaster web app manifest and complete PWA icon set aligned with the GymMaster OS design system.
- Add a production application service worker with an explicit cache allowlist for the public application shell and static assets.
- Add a branded offline fallback and connectivity state that never represents an offline mutation as successful.
- Add service-worker registration and update handling, while keeping the existing MSW worker isolated to its development/test purpose.
- Add a contextual, dismissible install experience with iOS guidance; do not interrupt login or critical staff operations.
- Add PWA/security headers and automated checks for manifest validity, installability, offline fallback, update behavior, and cache exclusions.
- Remove the existing simulated Water Tracker offline queue/success message, clear its legacy queue key, and describe water logs honestly as device-local data.
- Exclude push notifications, background sync, offline writes, and backend/API changes from this change.

## Capabilities

### New Capabilities

- `progressive-web-app`: Defines installability, manifest/branding, safe service-worker caching, offline/update UX, MSW coexistence, privacy boundaries, and PWA verification.

### Modified Capabilities

None. Existing nutrition and food-search requirements are unchanged.

## Impact

- Expected frontend areas: root App Router metadata/manifest, provider or client registration boundary, PWA UI components, offline route/state, public icon assets, Next.js response headers, and PWA-focused tests.
- Dependency impact: prefer the native Next.js manifest plus a small repository-owned service worker for this bounded cache policy; no PWA package is approved or added by this proposal.
- Runtime impact: service-worker behavior applies only in supported production browser contexts over secure origins; local MSW behavior remains development/test-only.
- Data/API impact: no backend contract, database schema, authentication, RBAC, or API payload changes. Authenticated API responses and mutation requests must not be stored in PWA caches.
- Existing behavior impact: Water Tracker keeps its current device-local log but no longer pretends to queue or synchronize that log with a backend.
