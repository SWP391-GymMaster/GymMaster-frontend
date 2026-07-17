## Why

The global Tailwind stylesheet remains the largest first-party render-blocking resource on `/login`, while the broader `experimental.inlineCss` Gate B increased encoded HTML and first-load transfer enough to require automatic reversion. One final, bounded route-scoped CSS experiment is justified only if static bundle attribution first proves that it can remove a meaningful amount of login CSS; otherwise Lighthouse optimization should stop so the repository can be finalized and pushed safely.

## What Changes

- Preserve a same-build `/login` baseline covering generated CSS composition, encoded HTML, first-load transfer, three valid Lighthouse mobile runs, representative auth/workspace visuals, and PWA/cache privacy.
- Add a no-edit feasibility gate that attributes the generated global stylesheet and proceeds only when a route-scoped Tailwind v4 boundary can reasonably remove at least 10 KiB gzip and 25% of first-party login stylesheet transfer without duplicating Preflight/theme layers.
- If the feasibility gate passes, perform one local-only proof of concept using explicit Tailwind source boundaries and layout-owned stylesheet entrypoints; keep truly global theme/base rules in the root and exclude workspace-only utilities from the auth route payload.
- Retain the proof only when median LCP improves by at least 10%, median Performance does not regress, first-party stylesheet transfer falls by at least 25%, encoded `/login` HTML remains at or below 50 KiB, total first-load transfer does not regress by more than 5%, and all auth, representative workspace, responsive, accessibility, PWA, and cache-privacy checks pass.
- Automatically restore the baseline before review when feasibility is insufficient or any retention criterion fails. A failed/reverted result ends login Lighthouse micro-experiments: no Gate D, no deployment of the experiment, and no further optimization work in this stream before repository finalization.
- Keep staging, commit, push, deployment, OpenSpec synchronization, and archival behind separate owner approval after the experiment result is presented.

## Capabilities

### New Capabilities

- `login-route-css-delivery`: Defines the measurable route-scoped CSS feasibility, retention, automatic-revert, and terminal stop contract for the final login delivery experiment.

### Modified Capabilities

_None._

## Impact

- Potential implementation surface is limited to `src/app/layout.tsx`, new or existing route-group layouts, `src/app/globals.css`, narrowly scoped auth/workspace stylesheet entrypoints, and focused build/Playwright evidence helpers.
- Authentication/session contracts, role redirects, user-facing copy, API/backend behavior, service-worker/offline behavior, dependencies, and unrelated component styling remain unchanged.
- The experiment is local-only and reversible. No configuration or CSS change may remain when its gates fail.
