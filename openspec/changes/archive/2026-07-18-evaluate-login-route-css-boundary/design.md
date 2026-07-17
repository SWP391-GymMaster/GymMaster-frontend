## Context

The restored Gate B baseline emits two first-party stylesheets on `/login`: a small 4,106-byte auth-facing sheet and a 231,811-byte generated global Tailwind sheet. Lighthouse transfers 35,190 bytes of first-party CSS, while the generated `/login` document is only about 5.4 KiB gzip. Global inlining removed the requests but expanded `/login` to 110.1 KiB gzip and increased generated first-load gzip by 17.44%, so that approach is closed.

Graphify and Understand Anything both identify `src/app/layout.tsx` as the sole importer of the complex `src/app/globals.css`; consequently every route receives utilities generated from the entire repository. The app currently has no shared `(auth)`, `(admin)`, `(staff)`, `(pt)`, or `(member)` route-group layouts. Tailwind v4 documentation supports multiple stylesheets with `source(none)` and explicit `@source` boundaries, while Next.js supports layout-owned global CSS but warns that ordering and persistent styles across client navigation must be controlled. This makes route-scoped delivery technically possible but broad enough to require a final reversible gate.

## Goals / Non-Goals

**Goals:**

- Prove from browser CSS coverage and generated output whether at least 10 KiB gzip and 25% of login stylesheet transfer can be removed safely before editing tracked runtime files.
- If feasible, evaluate one explicit-source, layout-owned Tailwind CSS boundary locally.
- Preserve GymMaster visual behavior across auth pages, four role workspaces, responsive states, theme presets, print styles, focus states, and reduced motion.
- Automatically restore the baseline on any failed criterion and terminate this optimization stream after a failed or infeasible Gate C.

**Non-Goals:**

- Redesigning UI, changing design tokens, removing supported utilities, or rewriting components to avoid Tailwind.
- Changing authentication, routes, APIs, PWA behavior, dependencies, copy, fonts, or `experimental.inlineCss`.
- Reaching the production LCP target through an open-ended sequence of CSS experiments.
- Staging, committing, pushing, deploying, synchronizing specs, or archiving without a later owner decision.

## Decisions

### 1. Run an untracked feasibility gate before source edits

Build the restored revision and capture CDP CSS coverage across `/login`, the remaining auth-shell routes, mobile/desktop breakpoints, focus/error/provider states, and reduced motion. Combine used-range evidence with generated stylesheet gzip size and selector/source attribution. Proceed only when the conservative removable portion is at least 10 KiB gzip and at least 25% of the current 35,190-byte first-party stylesheet transfer.

Coverage alone is not proof that a selector is unnecessary, so responsive, interaction, theme, print, and animation selectors are treated as required unless the proposed workspace entrypoint explicitly owns them. If the threshold is not met, record Gate C as infeasible without touching tracked runtime files.

### 2. Allow one explicit-source Tailwind proof of concept

The preferred proof keeps one root-owned stylesheet for Tailwind theme/Preflight, shared semantic tokens, and truly global base behavior. Auth and workspace utility entrypoints use Tailwind v4 `source(none)` plus explicit `@source` paths and are imported by route-group layouts. Shared route-group layouts may be added only to own these style entrypoints and must render children transparently.

The proof must not duplicate Preflight or theme layers, import global CSS from feature components, or rely on stylesheet removal during client navigation. If deterministic ordering or route ownership cannot be demonstrated in the generated build, the proof is reverted instead of introducing CSS Modules or a second architectural alternative.

### 3. Compare the same production build shape

Baseline and candidate use the same Next.js revision, Node/npm environment, Lighthouse 13.4.0 settings, viewport, throttling model, and local production server. Evidence includes encoded HTML, request graph, stylesheet transfer, total/first-party transfer, three-run medians, DOM/style ordering, and visual screenshots for representative routes.

The candidate is retained only when all proposal budgets pass. A statistically noisy LCP result that does not reach the 10% median improvement threshold counts as failure even if CSS bytes improve.

### 4. Treat failure as a terminal decision

Any feasibility miss, invalid build, CSS ordering issue, visual regression, route/PWA/auth regression, budget miss, or invalid Lighthouse comparison triggers restoration of every Gate C runtime/test helper edit, followed by a clean production rebuild and focused regression checks. Evidence and OpenSpec notes remain unstaged for review.

After a failed or infeasible Gate C, no Gate D is proposed. The next repository action is final validation, Graphify refresh, owner diff review, and safe `main` publication rather than further login Lighthouse experimentation.

## Risks / Trade-offs

- **[Coverage misses conditional styles]** → Exercise responsive, focus, validation, provider, theme, reduced-motion, and print states; conservatively classify uncertain ranges as required.
- **[Multiple Tailwind entrypoints duplicate theme or Preflight]** → Import those layers only at the root and inspect generated stylesheets for duplicate resets before Lighthouse testing.
- **[Nested layout CSS persists after client navigation]** → Validate direct loads and client transitions in both directions; reject conflicts rather than depend on stylesheet unloading.
- **[A smaller stylesheet does not improve LCP]** → Enforce the 10% median LCP threshold and terminal stop rule.
- **[Broad route-group churn]** → Layouts are transparent style owners only; no provider, auth, metadata, or DOM hierarchy changes are permitted.

## Migration Plan

1. Capture baseline and untracked feasibility evidence.
2. Stop with no runtime edit if feasibility thresholds fail.
3. If feasible, apply the single CSS-boundary proof and build locally.
4. Run static budgets, route/style-order checks, screenshots, regressions, and three Lighthouse comparisons.
5. Retain the candidate unstaged only if every gate passes; otherwise restore the baseline and rebuild.
6. Present evidence for owner review. No deployment occurs in this change without a separate decision.

## Open Questions

- The exact explicit `@source` path sets will be selected from measured coverage and generated selector attribution during the feasibility task; they are not guessed in advance.
- Production acceptance tasks in `improve-login-lighthouse-quality` remain separate and cannot be completed by a local Gate C result alone.

## Apply Environment

The approved Gate C apply uses commit `f2d0350e12401050c0eefec649a67b6338e28b60` on local `main`, Node.js 24.15.0, npm 11.16.0, Next.js 16.2.6, Tailwind CSS 4.3.0, and `@tailwindcss/postcss` 4.3.0. Current Next.js documentation confirms production CSS chunking/order follows layout import order; current Tailwind v4 documentation confirms explicit `source(none)` plus `@source` boundaries for multiple stylesheets. Lighthouse comparisons retain the approved 13.4.0 mobile settings and same-build local production server.

## Feasibility Result

The fresh restored production build completed all 44 routes and reproduced the expected `/login` boundary: 25,485 raw HTML bytes, 5,402 gzip HTML bytes, two ordered stylesheet links, no inline style, and 403,018 generated first-load gzip bytes. The first stylesheet was 4,106 raw/1,057 gzip bytes; the global Tailwind stylesheet was 231,811 raw/33,344 gzip bytes. All three Lighthouse runs transferred 35,190 bytes of first-party CSS.

Three valid Lighthouse 13.4.0 mobile reports recorded Performance 81/84/84, Accessibility/Best Practices/SEO 100 in every run, LCP 3.647/3.632/3.783 seconds, TBT 349/265/238 milliseconds, and CLS 0. Each JSON report had the correct final URL and no Lighthouse runtime error. The CLI exited `1` only after report creation because Windows denied temporary-profile cleanup with `EPERM`, matching the previously documented environment behavior.

CDP CSS coverage exercised `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/change-password`, and `/welcome` at 1440x900 and 412x823, including validation/focus, provider, reduced-motion, print, and temporary theme selector states. Across both first-party stylesheets, the conservative unused portion was 28,275 raw bytes and only 5,641 gzip bytes. The global sheet contributed 4,629 unused gzip bytes and the small sheet 1,012; together this is about 16.0% of the 35,190-byte transfer.

Gate C is therefore **infeasible**: 5,641 bytes misses the 10 KiB minimum and 16.0% misses the 25% transfer threshold. No tracked CSS, layout, component, configuration, font, auth, route, API, PWA, or dependency file was edited for the candidate. Conditional candidate, screenshot, regression, and comparative Lighthouse tasks are not applicable. This is the terminal result for login Lighthouse micro-experiments; no Gate D will be proposed before repository finalization.
