## Context

GymMaster is a frontend-only Next.js app for role-based gym operations. The current implementation already has strong business separation through API adapters, TanStack Query hooks, MSW handlers, auth/session guards, and role-specific route modules. The requested change is a desktop-first UX/UI rework based on screenshots captured in mock mode, not a business logic or backend contract change.

Baseline evidence:
- Knowledge graph is up to date at commit `ec7f79c4a420f12d23d0883d2428efd8dd1ad405`.
- Screenshot manifest: `docs/ux-audit/2026-06-30-apple-fitness-rework/baseline/desktop/manifest.json`.
- Coverage: 43 successful desktop captures across public/auth/admin/staff/PT/member/interactions.

Primary constraints:
- Do not add a login role picker or role switcher.
- Do not alter backend/API contracts, query keys, mock endpoint semantics, or auth/RBAC flow.
- Keep mobile/tablet behavior intact unless a change is required to preserve responsive compatibility.
- New runtime copy must be Vietnamese.
- Prefer existing stack and components: Next.js, TypeScript, Tailwind CSS, shadcn/ui style primitives, TanStack Query, Zustand, MSW, Lucide, Recharts, and Playwright.

## Goals / Non-Goals

**Goals:**
- Deliver a desktop visual system that feels cohesive in light/lime mode and can support an Apple Health/Fitness-inspired fitness operations product.
- Improve scanability, card alignment, modal ergonomics, typography hierarchy, and copy concision across implemented desktop routes.
- Preserve all current route paths, role guards, business actions, API adapters, mock flows, and tests that validate user outcomes.
- Establish screenshot-driven review as the acceptance gate for the rework.

**Non-Goals:**
- No backend, database, API, or auth contract changes.
- No mobile/tablet redesign beyond avoiding regression from shared component changes.
- No new runtime dependencies unless separately approved.
- No Figma/Kombai code import as-is.
- No product scope expansion such as new payment methods, barcode flows, image recognition, or new analytics.

## Decisions

### Decision 1: Rework shared desktop foundations before individual pages

The first implementation pass should target shared composition primitives such as `WorkspaceShell`, `CommandRail`, top command bar, metric cards, action panels, form/dialog surfaces, and empty states. This reduces per-page churn and keeps behavior stable because most pages already depend on the same shell and role frame components.

Alternative considered: redesign each route independently. This was rejected because it would increase style drift and make the business-preservation review harder.

### Decision 2: Keep lime as a semantic accent, not the full visual identity

The rework should retain Performance Lime for CTAs, active states, success/progress, and fitness energy, but reduce lime dominance in cards, badges, icons, and navigation. The desktop canvas should lean on mist/white/graphite neutrals with role-aware and health-aware accents.

Alternative considered: switch the primary accent away from lime. This was rejected for now because the user specifically wants to evaluate light/lime mode problems and because lime is part of the existing GymMaster palette.

### Decision 3: Use Apple Health/Fitness as interaction and hierarchy inspiration, not a clone

Use calm daily summaries, health metric rings, direct next actions, concise labels, and progressive disclosure. Avoid copying Apple visual assets, iconography, or exact component styling.

Alternative considered: continue the current GymMaster OS glass/bento look. This was rejected as the only direction because the team explicitly wants to try a different UX/UI approach.

### Decision 4: Treat copy and encoding as first-class UX work

The rework must include a Vietnamese copy pass and mojibake cleanup. Copy should be short, action-oriented, and product-native. Implementation/spec terms such as backend specs or overly explanatory helper text should not appear in primary UI copy unless the route is explicitly a technical/admin audit surface.

Alternative considered: only fix layout/colors first. This was rejected because current review feedback explicitly includes "AI slop" copy and visible encoding corruption.

### Decision 5: Validate with mock-mode route screenshots before and after implementation

The new `ux-rework-baseline.spec.ts` captures all implemented desktop routes plus the member progress dialog. After implementation, rerun the same target and compare route groups before approval to merge.

Alternative considered: rely only on manual browser review. This was rejected because the app has many implemented routes and role states.

### Decision 6: Use Kombai only as optional external design exploration

Kombai outputs may inform screen ideas or component direction. Runtime implementation must still be adapted manually into the existing component system, route guards, query hooks, accessibility rules, and Tailwind conventions.

Alternative considered: importing generated code directly. This was rejected because it risks breaking business logic, design tokens, role guards, and project conventions.

## Risks / Trade-offs

- [Risk] Shared shell changes may affect all protected routes at once. -> Mitigation: implement in small slices, run typecheck and targeted screenshots after each shell/component phase.
- [Risk] Desktop-first refactor may accidentally regress mobile because shell components are shared. -> Mitigation: keep mobile-specific navigation paths intact and run at least one mobile smoke screenshot after major shell changes.
- [Risk] Visual polish could drift into business-flow refactors. -> Mitigation: prohibit API/query/auth changes unless a UI bug cannot be fixed without a separately approved proposal.
- [Risk] Copy cleanup could alter test selectors if text-based tests exist. -> Mitigation: prefer stable `data-testid` selectors for tests and update assertions only when they validate user-visible copy intentionally.
- [Risk] Screenshot artifacts under `docs/` are currently ignored by `.gitignore`. -> Mitigation: keep them as local audit evidence or explicitly update ignore rules if the team wants to commit them.

## Migration Plan

1. Keep work on branch `feat/fe-uxui-system-rework`.
2. Preserve the baseline screenshots and manifest before changing UI code.
3. Implement foundation changes first: encoding/copy audit, color/surface tokens, shell/nav/top bar, shared surface components.
4. Migrate role workspaces in reviewable groups: admin/staff operations, PT workspace, member dashboard/nutrition/progress.
5. Rerun `npx playwright test src/tests/e2e/ux-rework-baseline.spec.ts --project=chromium` after each large phase.
6. Run `npm run typecheck`, `npm run lint`, and relevant existing e2e/component tests before asking to merge.
7. Rollback strategy: revert the specific UI/component slice on the feature branch; no data migration is involved.

## Open Questions

- Should screenshot/audit artifacts under `docs/ux-audit` be committed, or should they remain local evidence because `docs/` is currently ignored?
- Should the team approve the Apple Health/Fitness direction for all roles, or should admin/staff stay more operational while member/nutrition adopts the strongest Health/Fitness influence?
