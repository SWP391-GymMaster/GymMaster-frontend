## Why

The current desktop UI is functional and demo-ready, but the baseline screenshots show inconsistent visual cohesion between the dark command rail, light content surfaces, lime accent, dense copy, and uneven card layouts. The team wants a desktop-first Apple Health/Fitness-inspired rework while preserving all current business logic, API contracts, auth/RBAC behavior, mock data flows, and mobile/tablet behavior.

## What Changes

- Rework the desktop visual system toward a calmer Apple Health/Fitness-inspired operations surface: softer neutral backgrounds, clearer health/activity semantics, restrained lime usage, better dark/light panel cohesion, and tighter data hierarchy.
- Redesign reusable layout/composition patterns for desktop workspaces where needed, including `WorkspaceShell`, command rail/top command area, metric cards, action panels, wizard surfaces, member/nutrition dashboards, and dense admin/staff/PT workspaces.
- Shorten and normalize Vietnamese runtime copy so headings, descriptions, labels, helper text, and empty states feel concise and product-written rather than verbose.
- Fix visible desktop UI issues found in the baseline: uneven card heights, inconsistent button alignment, weak contrast between sidebar/right panels, cramped modal fields, overuse of repeated card styling, and mojibake/broken Vietnamese text.
- Add/maintain screenshot-driven review coverage for all implemented desktop routes in mock/MSW mode.
- Do not introduce role selection on login, backend changes, new API contracts, new business flows, or mobile/tablet redesign as part of this change.

## Capabilities

### New Capabilities

- `desktop-uxui-rework`: Desktop-first UX/UI rework requirements, visual guardrails, copy standards, role workspace coverage, and screenshot validation for the GymMaster frontend.

### Modified Capabilities

- None.

## Impact

- Affected code areas are expected to include shared layout and surface components under `src/components/layout`, `src/components/premium`, `src/components/data`, `src/components/feedback`, and role-specific workspace components under `src/features`.
- Route pages under `src/app/(admin)`, `src/app/(staff)`, `src/app/(pt)`, and `src/app/(member)` may change composition, but route paths, auth guards, role redirects, API adapters, TanStack Query keys, MSW handlers, and backend contracts must remain behavior-compatible.
- No new runtime dependency is planned. Any later dependency proposal requires separate approval.
- Validation should use MSW mock mode, typecheck, lint where practical, existing role-flow tests, and desktop screenshot review.
- Baseline screenshots were generated at `docs/ux-audit/2026-06-30-apple-fitness-rework/baseline/desktop/manifest.json` with 43 successful captures.
