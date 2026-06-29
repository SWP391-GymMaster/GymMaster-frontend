## 1. Baseline And Guardrails

- [x] 1.1 Review `docs/ux-audit/2026-06-30-apple-fitness-rework/audit.md` and baseline screenshot manifest before changing runtime UI.
- [x] 1.2 Confirm implementation scope excludes backend/API contracts, auth role redirect behavior, query key semantics, and MSW handler business behavior.
- [x] 1.3 Decide whether `docs/ux-audit` screenshots and OpenSpec change files should be committed by updating `.gitignore` intentionally if needed.
- [x] 1.4 Identify text-based tests that may need copy assertion updates after Vietnamese copy cleanup.

## 2. Desktop Foundation

- [x] 2.1 Verify and fix mojibake/corrupted Vietnamese copy in shared shell, command rail, auth/session messages, and frequently reused navigation labels.
- [x] 2.2 Rework desktop color/surface tokens in `src/app/globals.css` so light mode, lime accent, sidebar, top bar, and content panels feel cohesive.
- [x] 2.3 Update `WorkspaceShell` desktop composition for calmer canvas spacing, top command hierarchy, max-width rhythm, and reduced duplicated card framing.
- [x] 2.4 Update `CommandRail` desktop styling so role context, nav groups, disabled PT context, settings, and logout remain accessible but visually integrated with the light canvas.

## 3. Shared Components And States

- [x] 3.1 Rework shared metric/card surfaces used by dashboards so repeated cards align optically and maintain stable desktop dimensions.
- [x] 3.2 Rework dialog/form shell patterns for desktop spacing, label hierarchy, button alignment, and readable validation/error states.
- [x] 3.3 Rework wizard/status surfaces used by sell package, renew package, and assignment flows without changing form schemas or mutation behavior.
- [x] 3.4 Normalize empty/loading/error states for charts, tables, lists, and panels so they show a clear next action without placeholder-like boxes.
- [x] 3.5 Preserve `StatusPill`, `RoleBadge`, permission guard, and accessible status text behavior.

## 4. Role Workspace Migration

- [x] 4.1 Migrate admin dashboard, users, members, staff, trainers, packages, memberships, payments, assignments, audit logs, and notifications to the updated desktop surfaces.
- [x] 4.2 Migrate staff dashboard, member search/detail, sell package, renew package, check-in, and payments without changing business actions.
- [x] 4.3 Migrate PT dashboard, member list, check-in, member 360, workout, notes, and progress workspaces while preserving assigned-member constraints.
- [x] 4.4 Migrate member dashboard, membership, workout, notes, progress, meal journal, nutrition summary, and VNPay return presentation while preserving membership gates and API calls.

## 5. Copy, Accessibility, And Responsive Preservation

- [x] 5.1 Rewrite changed runtime copy in concise Vietnamese with direct action labels and no implementation jargon.
- [x] 5.2 Verify keyboard focus, hover, active states, accessible names, dialog close behavior, and reduced-motion compatibility on changed surfaces.
- [x] 5.3 Run at least one mobile/tablet smoke review after shared shell changes to ensure mobile command navigation remains usable.
- [x] 5.4 Keep login free of role pickers, role tabs, role cards, or header role switching.

## 6. Validation

- [x] 6.1 Run `npm run typecheck`.
- [x] 6.2 Run `npm run lint` (executed; fails on pre-existing baseline issues outside this UX slice).
- [x] 6.3 Run targeted component/e2e tests affected by changed copy, auth guards, forms, and role workspaces.
- [x] 6.4 Run `npx playwright test src/tests/e2e/ux-rework-baseline.spec.ts --project=chromium` and compare screenshots against baseline.
- [x] 6.5 Run `npx openspec validate desktop-apple-fitness-uxui-rework --strict` before requesting merge approval.
