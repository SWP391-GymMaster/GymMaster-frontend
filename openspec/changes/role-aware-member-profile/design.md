## Context

The repo already has a `member-360` module that powers Admin and PT member detail routes with `/api/v1/members/:id/profile-360`, plus supporting progress, check-in, workout, and trainer-note queries. Staff currently uses `StaffMemberDetailHero`, which pulls a narrower staff front desk DTO and does not share the richer profile hierarchy. `/member/profile` is listed in the route map but is not implemented.

Source-of-truth constraints:

- UI runtime copy is Vietnamese.
- RBAC remains route/data enforced by existing guards and backend/mock endpoints.
- PT can only access assigned members.
- Member can only access self-owned data.
- Staff operates check-in, sell, and renew workflows.
- Admin can manage membership and PT assignment workflows.
- No schema, query, mutation, endpoint, or backend business logic changes.

## Goals / Non-Goals

**Goals:**

- Provide a consistent Apple Health/Fitness-inspired Member Profile workspace across Admin, Staff, PT, and Member self routes.
- Keep route-level role boundaries explicit instead of exposing one full shared profile component to all roles.
- Reuse safe section primitives for visual consistency: profile hero, lifecycle summary, membership card, check-in rhythm, assigned PT, progress snapshot, activity timeline, and action rail.
- Add the missing `/member/profile` route with self-owned member data only.
- Keep desktop polished while retaining responsive stacking for smaller screens.

**Non-Goals:**

- Do not create new backend endpoints.
- Do not change existing API DTOs or query keys.
- Do not add a role picker, role switcher, or cross-role profile override.
- Do not implement editing forms beyond linking to existing allowed workflows.
- Do not solve live backend RBAC verification; this remains tracked by the existing backend-alignment audit.

## Decisions

### 1. Route wrappers stay role-specific

Each route keeps a role-specific entry component:

- `StaffMemberProfilePage` uses staff detail data and staff actions.
- `AdminMember360Page` uses 360 data and admin actions.
- `PtMember360Page` uses 360 data and PT actions.
- `MemberProfilePage` resolves the current member identity and uses member-scoped profile data.

Alternative considered: a single `MemberProfilePage` with a `role` prop and all data available internally. Rejected because it increases the risk of accidentally rendering sections/actions that a role should not see.

### 2. Presentation sections can be shared, data orchestration cannot

Small components can be shared when they receive already-filtered props. Examples: hero, membership summary, progress snapshot, check-in timeline, action rail, and empty/error shells. Data fetching remains inside the role wrapper.

Alternative considered: duplicate all UI by role. Rejected because the current Admin/PT/Staff profile views would continue drifting visually.

### 3. Profile layout prioritizes operational scan order

Desktop hierarchy:

1. Profile identity and status.
2. Role-aware action rail.
3. Membership/access state.
4. Check-in rhythm.
5. Assigned PT.
6. Progress snapshot.
7. Recent activity timeline.

This matches the user-approved priority order: personal info, membership, check-in, assigned PT, progress.

### 4. `/member/profile` should be self-owned and read-first

The Member route should show self profile, membership, assigned PT, progress, and training shortcuts without staff/admin management actions. If current member identity cannot be resolved from the authenticated profile in mock/API mode, the UI must show a clear empty/error state instead of falling back to another member.

### 5. Keep actions as navigation to existing workflows

Actions link to existing routes instead of creating new modals or mutations:

- Staff: `/staff/check-in`, `/staff/sell-package`, `/staff/renew-package`.
- Admin: `/admin/assignments`, `/admin/members`, `/staff/renew-package` where that workflow already exists.
- PT: `/pt/members/:id/notes`, `/pt/members/:id/workout`, `/pt/members/:id/progress`.
- Member: `/member/membership`, `/member/progress`, `/member/workout`, `/member/notes`.

Alternative considered: adding inline forms/actions inside the profile screen. Rejected for scope and because it risks changing existing business flows.

### 6. Member self profile uses a social-fitness presentation variant

`/member/profile` uses a stronger social profile layout than Admin/Staff/PT operational views: cover image, large avatar, compact social stats, segmented tabs, and a private activity feed. This keeps the member experience closer to a personal fitness journey instead of another dashboard.

Admin, Staff, and PT must not be routed into `/member/profile`, because that route is self-owned by the authenticated Member. If those roles need the same visual style later, it should be exposed through their existing role-scoped routes such as `/admin/members/:id`, `/staff/members/:id`, or `/pt/members/:id`, not by bypassing role guards.

## Risks / Trade-offs

- [Risk] `/member/profile` may not have a canonical self-profile endpoint yet. → Mitigation: use existing auth/member identity and current query hooks where possible; show a safe state if identity is unavailable.
- [Risk] Shared presentation components can still leak sensitive text if props are too broad. → Mitigation: pass minimal section props from role wrappers and keep role action arrays explicit.
- [Risk] The 360 endpoint name is already marked for future canonicalization. → Mitigation: do not change endpoint naming in this task.
- [Risk] Staff DTO is narrower than 360 DTO. → Mitigation: design staff profile to use the same visual shell with available staff fields only, not fake missing PT/progress data.
- [Risk] Existing component tests may assert old labels/structure. → Mitigation: update tests to assert user outcomes and role actions rather than exact old layout.

## Migration Plan

1. Add or refactor profile presentation components under `src/features/member-360/components`.
2. Migrate Admin/PT member detail pages to the new profile workspace while keeping existing query hooks.
3. Replace Staff member detail surface with the new staff-scoped profile wrapper using existing staff detail hook.
4. Add `/member/profile` route and a member self-profile wrapper.
5. Run targeted typecheck/lint/tests for profile components and routes.

Rollback is straightforward: revert this change's route/component edits; no data migration or API contract change is involved.

## Open Questions

- The live backend canonical endpoint for Member 360 remains outside this change and is tracked by the backend-alignment audit.
- If product later needs inline edit forms, that should be a separate spec because it affects validation, mutations, and role permissions.
- Review note: the desktop user dropdown correctly routes `Đổi mật khẩu` to the protected `/change-password` flow, and the existing form behavior is valid. Before merge, consider a small contract cleanup so `ChangePasswordForm` sends only `{ currentPassword, newPassword }` to `/api/v1/auth/change-password`; `confirmPassword` should remain frontend-only validation data and not be included in the backend payload.
