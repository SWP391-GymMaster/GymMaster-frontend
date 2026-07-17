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

### 7. Preload the Vietnamese Inter subset and stop preloading unused Geist Mono

The first production acceptance attempt after deployment passed the Performance, TBT, CLS, Accessibility, and contrast budgets but missed the LCP budget. Three valid Lighthouse 13.4.0 mobile runs reported Performance 89/88/90, Accessibility 100 in every run, TBT 94/194/109 milliseconds, CLS 0.049 in every run, and LCP 3.455/3.396/3.402 seconds. The resulting medians are Performance 89, TBT 109 milliseconds, and LCP 3.402 seconds. The LCP candidate is the Vietnamese login description text rather than the decorative cover or Google control.

The generated document currently preloads the Latin subsets of Inter and Geist Mono, while the browser discovers the Inter Vietnamese and Latin Extended font files later through CSS. Because the initial login copy is Vietnamese and Geist Mono is not required for the critical login text, the approved first remediation adds `vietnamese` to the Inter subsets and sets `preload: false` for Geist Mono. Inter retains `display: "swap"`, the existing CSS variables and font-family fallbacks remain unchanged, and no authentication, PWA, route, copy, or Google Identity Services behavior changes.

This is preferred over preloading every available subset because it targets the actual initial-language glyphs while avoiding another unused critical request. It is preferred over changing Inter to `display: "optional"` in this pass because that can intentionally retain the fallback font on a slow first visit and therefore changes the visual rendering trade-off. If the LCP budget still fails after this remediation, `display: "optional"` requires a separate owner approval and production validation.

The local production-build verification generated only the Inter Vietnamese and Latin preload links; Geist Mono remained available through its CSS variable but was absent from the document preloads. The Vietnamese font request moved from late CSS discovery to the initial high-priority preload, and the prior 23 KB Geist Mono preload was removed. Three valid local Lighthouse 13.4.0 mobile runs then reported Performance 87/86/89, LCP 3.798/3.792/3.775 seconds, TBT 120/183/56 milliseconds, CLS 0 in every run, and 100 for Accessibility, Best Practices, and SEO in every run. The resulting medians are Performance 87, LCP 3.792 seconds, and TBT 120 milliseconds. A single earlier local production report measured Performance 86 and LCP 3.952 seconds, so the new result is directionally better but is not a valid three-run A/B proof and still misses the 2.5-second LCP budget. The remaining late Inter Latin Extended request means a separate display-strategy decision is more appropriate than expanding this approved pass silently.

### 8. Evaluate Inter optional display as a local-only experiment

The owner approved a local-only experiment that changes Inter from the Next.js default `display: "swap"` to `display: "optional"` while retaining the Latin/Vietnamese preloads and the disabled Geist Mono preload. Next.js documents `optional` as a very short block period with no swap period, which allows the browser to retain the fallback font for a slow first visit instead of delaying or repainting text for a late Inter response. This experiment changes no copy, layout classes, authentication, PWA, route, Google Identity Services, or backend behavior.

Acceptance compares three Lighthouse 13.4.0 mobile runs from the optional-display production build with the immediately preceding three-run local baseline: median Performance 87, median LCP 3.792 seconds, median TBT 120 milliseconds, worst CLS 0, and 100 for Accessibility, Best Practices, and SEO. The optional setting is retained only when all runs are valid, the median LCP improves by at least 10 percent without regressing the existing Performance/TBT/CLS/accessibility budgets, and normal plus delayed-font mobile/desktop screenshots keep all critical copy, controls, hierarchy, and responsive layout legible. Reaching the production LCP target of 2.5 seconds remains the preferred outcome; a material local improvement below that threshold still requires a separately approved production deployment and the existing production acceptance gate.

If the median LCP improvement is below 10 percent, another quality budget regresses, or fallback rendering is visually unacceptable, the experiment restores the prior implicit `swap` behavior before owner review. Preloading the 85 KB Latin Extended file is explicitly outside this experiment because it could increase critical-path contention and requires its own evidence and approval.

The optional-display build and visual gate completed successfully: generated Inter faces used `font-display: optional`, the two Inter preloads were unchanged, Geist Mono remained absent from preloads, and both normal and deliberately delayed-font screenshots kept the same card, paragraph, and action dimensions at 412x823 and 1440x900 with no overflow or unreadable Vietnamese copy. The performance gate did not pass. Three valid local Lighthouse 13.4.0 mobile runs reported Performance 79/85/84, LCP 3.575/3.790/3.780 seconds, TBT 448/206/237 milliseconds, CLS 0 in every run, and 100 for Accessibility, Best Practices, and SEO in every run. The medians are Performance 84, LCP 3.780 seconds, and TBT 237 milliseconds. Compared with the 3.792-second LCP baseline, the 12-millisecond improvement is approximately 0.3 percent, below the required 10 percent, while Performance and TBT also missed their budgets. The experiment therefore restored Inter's prior implicit `display: "swap"` behavior and did not promote `optional` into the reviewable implementation.

### 9. Keep the change open after the `f2d0350` production mobile gate

GitHub and Vercel confirmed commit `f2d0350` as a successful Production deployment before the final acceptance attempt. Three sequential, valid Lighthouse 13.4.0 mobile-preset runs against `https://gymmaster-os.vercel.app/login` produced the following results:

| Run | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS | Contrast |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 89 | 100 | 100 | 100 | 3.196 s | 175 ms | 0.049 | Pass |
| 2 | 91 | 100 | 100 | 100 | 2.735 s | 253 ms | 0.049 | Pass |
| 3 | 88 | 100 | 100 | 100 | 3.191 s | 184 ms | 0.049 | Pass |

The acceptance aggregates are median Performance 89, median LCP 3.191 seconds, median TBT 184 milliseconds, and worst CLS 0.049. Performance, TBT, CLS, Accessibility, and contrast pass their approved budgets. Median LCP fails the required maximum of 2.5 seconds. Higher category scores observed through a browser extension may use a different form factor, throttling profile, cache state, or Lighthouse version and therefore do not replace the pinned mobile acceptance method in this change.

The production PWA regression smoke passed independently. `/login`, `/manifest.webmanifest`, `/sw.js`, and `/offline.html` returned HTTP 200; the Vietnamese login shell rendered with `lang="vi"`; no role-selection control appeared; the Google region reached its ready state; the service worker controlled the page; and Cache Storage contained only six approved same-origin static/offline resources. No Google, login document, API, or protected-role response was cached. After the browser was placed offline, navigation rendered the Vietnamese offline fallback successfully. No real production credential was submitted during this smoke pass; the existing automated auth tests remain the functional evidence for email/password, mock Google sign-in, backend-role redirects, safe errors, and the no-role-picker rule.

Because the production LCP requirement remains unmet, tasks 6.4 and 6.5 stay open. The delta spec must not be synchronized and the change must not be archived until the owner approves either another focused remediation or an explicit acceptance-budget revision and the resulting gate passes. Raw Lighthouse reports and smoke screenshots remain local artifacts under `output/playwright/login-quality-production-final/`.

### 10. Use evidence-ranked, independently approved remediation gates

The three `f2d0350` production reports separate the Lighthouse displayed/modelled metric from the observed trace. Displayed LCP was 3.196/2.735/3.191 seconds (median 3.191 seconds), while observed LCP was 1.348/0.313/1.440 seconds (median 1.348 seconds). Every run selected the same server-rendered description paragraph, `main.auth-os-shell > section.relative > div.mb-8 > p.mt-3`, as LCP. The observed breakdown reported time to first byte of 154/133/252 milliseconds and element render delay of 1,194/180/1,188 milliseconds. The backend response audit remained only 34/32/37 milliseconds, so backend work is not a credible remediation target.

Two first-party stylesheets, approximately 1.3 KB and 31.9 KB encoded, remained render-blocking. Lighthouse estimated their LCP cost at 550/200/600 milliseconds (median 550 milliseconds). The route transferred approximately 705/721/705 KB overall and 374/390/374 KB of JavaScript across 17 scripts. The first-party `05cf9_aeei9w0.js` validation/forms chunk transferred 57-74 KB and was 83.8 percent unused in the trace, accounting for 48-62 KB of estimated removable bytes. Lighthouse estimated unused-JavaScript LCP savings of 300/300/150 milliseconds (median 300 milliseconds).

The evidence does not support another font or Google-first pass. The three first-party Inter files completed by approximately 0.428/0.323/0.513 seconds, before observed LCP; the font-display insight only identified later Google Sans resources with about 50 milliseconds of FCP savings. Google Identity Services began after observed LCP in every run, consumed only about 12 milliseconds of reported third-party main-thread time, and therefore is not the primary LCP cause. Shortening or hiding the Vietnamese description solely to change the LCP candidate is rejected as metric gaming.

**Gate A - route-scoped validation isolation.** `LoginForm` currently imports `zodResolver` and the runtime `loginSchema` before the user interacts, even though the default React Hook Form mode validates on submit. The first remediation will retain React Hook Form and the existing Zod schema but move the schema/resolver work behind the submit boundary. The initial form remains server-prerendered and hydrated, invalid input still produces the same field messages, no auth mutation occurs for invalid input, valid login and all role redirects remain unchanged, and the submit button remains pending while deferred validation runs. The implementation is retained only if a production build proves that submit-only validation code is absent from the synchronous `/login` request graph, encoded initial JavaScript decreases by at least 40 KB, and three comparable local Lighthouse mobile runs improve median LCP by at least 10 percent without regressing the existing Performance, TBT, CLS, Accessibility, contrast, or auth/PWA gates.

**Gate B - independently gated local-only CSS inlining experiment.** Gate B no longer depends on Gate A passing. Gate A's failure showed that a large JavaScript reduction did not materially improve the modelled LCP, while the production reports still identify two render-blocking first-party stylesheets with a median estimated LCP cost of 550 milliseconds. This makes the CSS request boundary an independently testable hypothesis, not an automatic continuation of Gate A. Only after a separate implementation approval may `experimental.inlineCss: true` be tried in `next.config.ts`. Next.js 16.2 documentation describes this flag as experimental, global, and production-build-only; it replaces stylesheet links with inline style tags in the document head. Because the flag affects every route and changes HTML/cache trade-offs, the experiment must compare encoded HTML plus total first-load transfer, keep `/login` HTML at or below 50 KB encoded, and smoke-test `/welcome`, all four role dashboards, the shared auth routes, the offline fallback, service-worker control, and cache privacy. It is retained only when three valid local mobile runs meet the full production budgets, all representative route/PWA checks pass, and no first-load transfer regression exceeds 5 percent. Otherwise it is reverted before review.

The Gate A experiment met its bundle and behavior boundaries but failed its required performance comparison. Against the same-build baseline of 304,470 encoded synchronous JavaScript bytes, 965,013 uncompressed route first-load bytes, median Performance 85, median LCP 3.781 seconds, and median TBT 207.5 milliseconds, the experiment reduced synchronous JavaScript to 238,896 encoded bytes and route first-load JavaScript to 677,173 uncompressed bytes. This is a 65,574-byte encoded reduction, exceeding the 40 KB bundle threshold. Production-mode browser inspection initially exposed automatic `/signup` and `/forgot-password` prefetches that reintroduced shared Zod chunks; disabling prefetch only for those two login links removed the validation chunks before interaction. Submitting invalid data then requested the two deferred chunks, rendered the exact existing field message, and did not call the auth mutation. Focused auth/PWA tests, typecheck, lint with only pre-existing warnings, and the production build passed.

The three post-change Lighthouse 13.4.0 mobile reports were valid and scored Accessibility, Best Practices, and SEO at 100 with CLS 0 in every run, but reported Performance 79/78/82, LCP 3.727/3.943/3.724 seconds, and TBT 401.5/329/315.5 milliseconds. The resulting medians are Performance 79, LCP 3.727 seconds, and TBT 329 milliseconds. Median LCP improved by only about 1.4 percent instead of the required 10 percent, while Performance and TBT regressed. Gate A was therefore fully reverted from application and test source before review. `next.config.ts` remains unchanged.

On 2026-07-17 the owner approved this proposal-only amendment so Gate B can be reviewed on its own evidence. That approval authorizes edits to the OpenSpec artifacts only. It does not authorize changing `next.config.ts`, running the experiment, retaining a configuration diff, staging, committing, pushing, or deploying. Before implementation, the owner must approve the revised proposal, design, delta spec, and task list as the separate Gate B apply decision.

If that apply decision is approved, Gate B will use the restored pre-experiment build as its comparison state, recapture encoded `/login` HTML, stylesheet boundaries, total first-load transfer, and three-run Lighthouse medians before editing, then change only the existing Next.js configuration to add `experimental.inlineCss: true`. No dependency, route, copy, authentication, PWA, or application-component change is in scope. The production build must then prove that stylesheet links are replaced by inline styles and exercise the full route/PWA matrix. Any invalid audit, missed production budget, encoded HTML above 50 KB, first-load transfer regression above 5 percent, route failure, or PWA/privacy regression triggers an automatic configuration revert and a restored production rebuild before owner review. A passing experiment remains unstaged and undeployed until another explicit owner decision.

The separately approved Gate B implementation was evaluated locally and rejected at its first production-output hard gate. The restored baseline build generated `/login` HTML of 25,485 raw bytes and 5,400 gzip bytes, two stylesheet links, no inline style, and 403,016 gzip bytes across the generated document plus referenced static first-load resources. Three valid Lighthouse 13.4.0 mobile baselines reported Performance 64/62/63, LCP 5.587/5.564/5.565 seconds, TBT 501/570/519 milliseconds, CLS 0, and Accessibility/Best Practices/SEO 100 in every run. First-party transfer was 479,981 bytes and first-party stylesheet transfer was 35,190 bytes in each run. The Lighthouse CLI returned `EPERM` only while deleting its Windows temporary profile after writing each report; every accepted JSON report used the correct URL, had no Lighthouse runtime error, and contained complete audit data.

Adding only `experimental.inlineCss: true` produced a valid Next.js 16.2.6 production build and replaced the two stylesheet links with one inline style containing 236,060 raw CSS bytes. However, generated `/login` HTML expanded to 741,579 raw bytes and 110,100 gzip bytes, more than twice the approved 50 KB encoded-document limit. The generated first-load gzip total increased to 473,315 bytes, approximately 17.4 percent above baseline and therefore above the 5 percent limit. Every representative static route also expanded to approximately 107-110 KB gzip. Because either hard-gate failure independently requires an immediate revert, downstream Lighthouse and inline-build route/PWA runs were short-circuited rather than used to override a deterministic rejection.

The configuration was automatically restored and a fresh production rebuild returned to two stylesheet links, no inline style, `/login` HTML of 25,485 raw bytes and 5,402 gzip bytes, and 403,018 generated first-load gzip bytes. Typecheck, focused auth/PWA tests (60/60), and lint with zero errors and 33 pre-existing warnings passed on the restored state. Production PWA E2E passed manifest/worker-header and cache-privacy tests, but its existing offline-navigation assertion failed twice on the restored build because `/member/dashboard` rendered the unauthenticated permission state instead of the offline document. Since no Gate B configuration or application diff remained, this is recorded as a separate baseline PWA test gap and not attributed to CSS inlining. Gate B remains rejected and must not be staged, deployed, synchronized, or archived.

This ladder is preferred over splitting the entire global provider/CSS architecture because those changes span every workspace and exceed the failed route's evidence. It is preferred over lowering the 2.5-second gate because the owner approved that gate before implementation. Neither phase authorizes new dependencies, copy changes, a role picker, auth/session/API changes, PWA cache changes, staging, committing, pushing, or production deployment without the existing review gates.

### 11. Archive the stream as rejected after the no-edit Gate C result

The separately approved Gate C feasibility pass measured generated stylesheet attribution and representative browser CSS coverage before any tracked CSS or layout edit. Across the required auth routes, responsive states, focus/validation/provider states, reduced motion, print, and temporary theme states, the conservative separable estimate was 5,641 gzip bytes, about 16.0% of the 35,190-byte first-party login stylesheet transfer. This missed both feasibility thresholds: at least 10 KiB gzip and at least 25% of stylesheet transfer. No route-scoped Tailwind entrypoint, layout boundary, candidate build, or runtime CSS/configuration change was created.

The owner subsequently approved stopping further login Lighthouse experimentation, synchronizing only the independent PWA correction, and archiving this stream. Tasks 6.4 and 6.5 remain unchecked because the original production LCP acceptance budget did not pass and no final acceptance was granted. Archiving therefore means terminal/rejected with a known LCP gap, not accepted quality. The experimental `login-experience-quality` delta is intentionally not synchronized into canonical product specs.

## Risks / Trade-offs

- **[Removing the mobile photograph makes the narrow login visually plainer]** -> Preserve the branded gradient, glass card, mark, spacing, and responsive hierarchy; capture mobile and desktop screenshots before accepting the visual result.
- **[The existing WebP may not match the PNG crop or quality at large desktop sizes]** -> Compare at representative desktop widths; only generate a new responsive variant if the existing file fails while keeping the encoded response at or below 150 KB.
- **[Idle Google loading can make the provider button appear after the email form]** -> Reserve its final dimensions, show an accessible loading state, warm it after critical render, and expose retry feedback on failure.
- **[Lighthouse results vary with network and deployment state]** -> Pin the Lighthouse version/preset, audit one deployed revision, use three runs, compare medians, and record raw reports.
- **[Route-scoped colors can drift from future global theme changes]** -> Define the small auth token set centrally and cover computed contrast in the acceptance audit.
- **[A shared auth-shell change can affect signup/password pages]** -> Run focused responsive smoke checks on every route importing `AuthOSShell`, while keeping the formal performance budget scoped to `/login`.
- **[Adding a Vietnamese preload can increase bytes fetched by routes whose initial copy is Latin-only]** -> Keep the change limited to the existing global Inter family, verify generated preload links and transfer timing, and compare three production-like Lighthouse runs before approving deployment.
- **[Disabling Geist Mono preload can delay the first use of technical monospace metadata]** -> Preserve on-demand font loading through the existing CSS variable and verify that `/login` does not rely on Geist Mono for critical content.
- **[`optional` can leave the fallback font visible for the entire first visit]** -> Compare normal and deliberately delayed-font screenshots at mobile and desktop sizes; retain the setting only when hierarchy, wrapping, controls, and Vietnamese readability remain acceptable.
- **[Deferred validation can change error timing or field mapping]** -> Keep React Hook Form state, reuse the existing Zod schema, map every issue to the same field/message, and prove invalid input never reaches the auth mutation.
- **[A dynamic validation chunk can be prefetched accidentally]** -> Inspect the production request graph before interaction and reject Gate A if Zod/resolver remains in a synchronous or automatically prefetched login chunk.
- **[Global CSS inlining can duplicate styles in HTML and reduce repeat-view cache efficiency]** -> Separate planning approval from implementation approval, apply encoded document/total-transfer budgets, test representative workspaces, and automatically revert on any budget or functional regression.

## Migration Plan

1. Preserve the production Lighthouse baseline and capture current login screenshots/network evidence.
2. Introduce the dedicated auth cover reference and mobile-first media treatment; verify the cover request boundary and desktop visual match.
3. Reduce the auth shell client boundary and apply scoped accessible action/link styles.
4. Move Google Identity Services to the approved deferred lifecycle with stable loading/error states.
5. Run targeted auth tests, responsive Playwright checks, full typecheck/lint/unit/build gates, and local production-mode smoke checks.
6. Present the staged diff and visual/check evidence to the owner; do not commit or push before explicit approval.
7. After the first production audit misses only the LCP budget, record the evidence, apply the approved Vietnamese Inter/Geist Mono preload remediation, and repeat the local production-build checks before presenting the unstaged diff.
8. Run the separately approved local-only Inter optional-display experiment, retain or revert it using the documented performance and visual criteria, and present the unstaged result.
9. After the separately approved follow-up deployment, run the three production Lighthouse audits and PWA cache regression check, then complete/archive the change only if every acceptance criterion passes.
10. Apply Gate A only after owner approval, compare its bundle and three-run local evidence, and stop for review before any Gate B edit.
11. Present the revised Gate B proposal, design, delta spec, and tasks; do not edit `next.config.ts` until the owner separately approves implementation.
12. If implementation is approved, capture the restored same-build baseline, run the local-only global CSS-inlining experiment with representative route/PWA checks, and automatically revert it when any documented local gate fails.
13. Present the complete unstaged experiment result and local evidence before any commit, deployment, or repeat production acceptance run.
14. After Gate C fails its no-edit feasibility thresholds, record the explicit owner-approved terminal disposition and archive the stream as rejected while preserving the unmet production acceptance tasks.

Rollback restores the prior auth-shell asset/style and Google script lifecycle without touching auth-session or PWA files. Because the change does not alter persistent data, backend contracts, or service-worker versions, no data migration or cache purge is required.

## Open Questions

None are blocking at proposal time. The existing 81 KB WebP is the default desktop asset; producing another variant is contingent only on failing the defined visual or transfer acceptance check and does not authorize a broader redesign.
