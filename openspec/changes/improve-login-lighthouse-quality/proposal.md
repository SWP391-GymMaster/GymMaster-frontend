## Why

The deployed `/login` route is functionally correct and preserves the approved PWA, authentication, and RBAC flows, but the 2026-07-17 production mobile Lighthouse baseline is only 61 Performance and 96 Accessibility, with an 8.6-second LCP, two WCAG contrast failures, and avoidable image and third-party resource cost. This change makes the public login entry point faster, more stable, and WCAG AA compliant before it becomes the first impression for additional users.

## What Changes

- Establish measurable production-quality budgets for the public login route: median mobile Lighthouse Performance at least 85 across three comparable runs, Accessibility 100, LCP at most 2.5 seconds, TBT at most 200 milliseconds, and CLS at most 0.1.
- Replace the 763 KB login cover delivery with an optimized responsive treatment that does not download a desktop-scale decorative image unnecessarily on narrow screens; reuse the existing 81 KB WebP asset when it satisfies visual quality.
- Keep the login heading, description, and form available in the initial critical render without entrance behavior that delays the LCP candidate or shifts the card after first paint.
- Correct the GymMaster OS link and primary login action contrast to WCAG 2.2 AA while preserving the approved Iron/Lime/Steel visual direction and visible focus states.
- Move Google Identity Services out of the critical rendering path while preserving real Google sign-in, mock/test behavior, pending/error feedback, and the first user interaction.
- Add focused regression and production-mode verification for email login, Google login, responsive presentation, accessibility, and repeatable Lighthouse acceptance.
- Keep authentication contracts, role redirects, protected routes, backend APIs, PWA registration/cache policy, and product copy semantics unchanged.

## Capabilities

### New Capabilities

- `login-experience-quality`: Defines measurable production performance, responsive media delivery, render stability, accessible contrast, deferred third-party authentication loading, and regression verification for the public login experience.

### Modified Capabilities

None. The existing `progressive-web-app` capability and current authentication behavior remain unchanged.

## Impact

- Expected frontend areas: `AuthOSShell`, `LoginForm`, `GoogleLoginButton`, shared auth styling/tokens, GymMaster asset aliases, and focused auth/unit/Playwright verification.
- Expected public assets: reuse or add optimized responsive variants derived from the approved GymMaster operations cover; do not change the overall brand direction.
- Runtime impact: less image transfer on `/login`, no critical-path Google Identity Services request, improved first-render stability, and AA-compliant interactive colors.
- Dependency impact: no new runtime dependency is approved. Use existing Next.js 16 image/script capabilities and current test tooling; any new audit dependency requires separate owner approval.
- Contract impact: no backend, API payload, authentication/session, RBAC, route-map, service-worker, manifest, cache allowlist, or offline behavior changes.
