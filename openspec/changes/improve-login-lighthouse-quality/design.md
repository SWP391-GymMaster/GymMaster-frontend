## Context

The production PWA at `https://gymmaster-os.vercel.app/login` is installable and its service-worker privacy boundary is working as specified. A mobile Lighthouse 13.4.0 audit on 2026-07-17 nevertheless reported Performance 61, Accessibility 96, FCP 2.8 seconds, LCP 8.6 seconds, TBT 210 milliseconds, CLS 0.072, and Speed Index 6.4 seconds.

The largest concrete transfer issue is the login shell's decorative operations cover. `AuthOSShell` currently references `public/assets/gymmaster/covers/gym-operations-cover.png` (763,494 bytes) through a shared alias even though the repository already contains `public/assets/gymmaster/gym-operations-cover.webp` (81,282 bytes). The CSS background is applied at every viewport, so mobile clients also fetch it. The shell is unnecessarily marked as a client component even though only its nested form needs client behavior.

The audit also found insufficient contrast on the GymMaster OS link and primary login button. The current real-mode `GoogleLoginButton` injects `https://accounts.google.com/gsi/client` immediately on mount, renders into an initially empty container, and lets Google load additional font resources. Existing Vitest and Playwright auth tests already protect email/password login, mock Google login, backend-role redirects, safe errors, and the no-role-picker rule.

The stakeholders are unauthenticated users and all four roles that enter through the same login route. Constraints are Next.js 16.2 App Router, Vietnamese runtime copy, the GymMaster OS Iron/Lime/Steel identity, WCAG AA, no new runtime dependency, unchanged backend/auth/RBAC contracts, and unchanged PWA caching behavior.

## Goals / Non-Goals

**Goals:**

- Reduce the public login critical path and meet the approved three-run production Lighthouse budgets.
- Avoid downloading the decorative operations cover on mobile and keep the desktop cover transfer within a strict budget.
- Render the login heading, description, and form immediately and keep the Google-button region dimensionally stable.
- Make all login text and interactive states WCAG 2.2 AA compliant without changing the product's visual direction.
- Load Google Identity Services after critical first-party content while preserving real and mock Google sign-in behavior.
- Keep the change small, route-focused, testable, and independently reversible.

**Non-Goals:**

- Changing login payloads, auth-session state, role detection, redirect maps, permission guards, backend APIs, or OAuth providers.
- Redesigning the login flow, adding a role picker, changing Vietnamese product meaning, or modifying other workspaces.
- Changing the manifest, service worker, cache allowlist, offline page, install UX, or production deployment architecture.
- A global palette redesign, broad JavaScript/bundle refactor, or replacement of the existing Next.js font setup.
- Adding Lighthouse, accessibility, image, or Google SDK packages to the repository without separate owner approval.

## Decisions

### 1. Use a mobile-first auth background and the existing optimized WebP

The base auth shell will render the current light GymMaster gradient without a raster cover. At the existing desktop breakpoint, a route-scoped auth-shell media rule will add the existing 81,282-byte WebP as the decorative cover beneath the gradient. The asset will not be preloaded because it is decorative and is not the LCP target. The implementation will give the auth cover its own asset key so the change does not silently alter member dashboard imagery that still uses the legacy shared alias.

This is preferred over keeping the PNG because it removes roughly 89% of the encoded bytes before responsive exclusion. It is preferred over restructuring the shell around a semantic `<Image>` because the cover conveys no content, and a CSS media query can prevent the mobile request with less layout and accessibility risk. Next.js `getImageProps` plus CSS `image-set()` remains an allowed fallback only if the existing WebP fails the desktop visual check or the transfer budget.

### 2. Keep the shell server-renderable and the interactive form client-owned

Remove the unnecessary client directive from `AuthOSShell`; its links, headings, description, footer, and security badge are pure render output. `LoginForm` and `GoogleLoginButton` remain client components because they own form state, router transitions, auth-session mutations, and provider initialization.

Critical login text and form structure must not begin at `opacity: 0`, wait for a mount flag, or use a delayed entrance animation. The card retains its existing static glass treatment. Any press/hover feedback remains interaction-only and respects the existing motion rules.

This split is preferred over converting the whole auth route to client rendering because it reduces the hydration surface while retaining the existing behavior. It is also preferred over removing all auth-shell styling because the production issue is resource timing, not the approved visual concept.

### 3. Add auth-scoped accessible action colors instead of changing global theme tokens

Introduce route-scoped auth action/link styling that is measured against the actual card, muted chip, and button backgrounds. Normal-size text must reach at least 4.5:1; focus indicators and meaningful non-text boundaries must reach at least 3:1. The primary login action will use a dark Iron-family foreground on Performance Lime when that pairing passes, while links use a darker brand-green treatment suitable for light surfaces.

This is preferred over darkening `--primary` globally because a global token change would alter every role workspace and exceed the approved scope. Hover, disabled, focus-visible, and error states will be checked independently rather than assuming the default state covers them.

### 4. Load Google Identity Services after critical first-party UI with a stable placeholder

Real mode will use Next.js script lifecycle support with `lazyOnload` (or an equivalent idle-time boundary verified in the production network trace), initialize Google exactly once, and replace a fixed-height accessible loading placeholder with the official Google-rendered button. The container width and minimum height remain stable before and after provider rendering to avoid layout shift. Initialization failure exposes a safe Vietnamese retry/error state; it must not leave a permanently blank control area.

Mock/test mode continues to render the repository-owned button and submit the existing fake ID token without requesting Google resources. Missing-client-ID mode remains disabled and explanatory. Event handlers and initialization remain idempotent across rerenders and route revisits.

This is preferred over immediate manual script injection because it removes Google resources from the initial critical request path. It is preferred over a custom real-mode Google button because the official provider button avoids branding and sign-in-policy drift. Fully loading the provider only after a click was rejected because rendering the official button after that click can require a confusing second activation or lose the browser user gesture.

### 5. Use layered verification and a deterministic production acceptance method

Focused component tests will cover script lifecycle states, one-time initialization, failure feedback, stable placeholder semantics, and unchanged mock behavior. Existing auth tests remain the contract gate for email/password login, Google mock login, backend-role redirect, and absence of role selection. Playwright will add responsive request assertions (no cover request below the desktop breakpoint), critical-content visibility, and login-page layout/interaction regression checks against a production build.

Final acceptance uses Lighthouse 13.4.0 with the mobile preset against the same deployed revision, three sequential runs after deployment health is confirmed, and the median of Performance/LCP/TBT plus the worst CLS. Accessibility must be 100 in every run and the report must contain no contrast failure. Reports stay as local/CI artifacts unless the owner separately approves committing them; Lighthouse remains an execution tool rather than a repository dependency.

### 6. Keep PWA and authenticated data boundaries untouched

No file under the manifest/service-worker/offline implementation is changed. The optimized auth cover remains an approved same-origin public brand asset, while the cross-origin Google request continues to bypass the PWA cache. Production verification will inspect Cache Storage only as a regression check and must find no Google, auth, API, or protected-route response added by this change.

## Risks / Trade-offs

- **[Removing the mobile photograph makes the narrow login visually plainer]** -> Preserve the branded gradient, glass card, mark, spacing, and responsive hierarchy; capture mobile and desktop screenshots before accepting the visual result.
- **[The existing WebP may not match the PNG crop or quality at large desktop sizes]** -> Compare at representative desktop widths; only generate a new responsive variant if the existing file fails while keeping the encoded response at or below 150 KB.
- **[Idle Google loading can make the provider button appear after the email form]** -> Reserve its final dimensions, show an accessible loading state, warm it after critical render, and expose retry feedback on failure.
- **[Lighthouse results vary with network and deployment state]** -> Pin the Lighthouse version/preset, audit one deployed revision, use three runs, compare medians, and record raw reports.
- **[Route-scoped colors can drift from future global theme changes]** -> Define the small auth token set centrally and cover computed contrast in the acceptance audit.
- **[A shared auth-shell change can affect signup/password pages]** -> Run focused responsive smoke checks on every route importing `AuthOSShell`, while keeping the formal performance budget scoped to `/login`.

## Migration Plan

1. Preserve the production Lighthouse baseline and capture current login screenshots/network evidence.
2. Introduce the dedicated auth cover reference and mobile-first media treatment; verify the cover request boundary and desktop visual match.
3. Reduce the auth shell client boundary and apply scoped accessible action/link styles.
4. Move Google Identity Services to the approved deferred lifecycle with stable loading/error states.
5. Run targeted auth tests, responsive Playwright checks, full typecheck/lint/unit/build gates, and local production-mode smoke checks.
6. Present the staged diff and visual/check evidence to the owner; do not commit or push before explicit approval.
7. After the separately approved deployment, run the three production Lighthouse audits and PWA cache regression check, then complete/archive the change only if every acceptance criterion passes.

Rollback restores the prior auth-shell asset/style and Google script lifecycle without touching auth-session or PWA files. Because the change does not alter persistent data, backend contracts, or service-worker versions, no data migration or cache purge is required.

## Open Questions

None are blocking at proposal time. The existing 81 KB WebP is the default desktop asset; producing another variant is contingent only on failing the defined visual or transfer acceptance check and does not authorize a broader redesign.
