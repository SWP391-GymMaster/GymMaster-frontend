## Why

Member profile is a core demo surface, but the current implementation is split between a richer Admin/PT Member 360 view and a thinner Staff detail view, while `/member/profile` is still missing. This creates inconsistent UX and makes it harder to show the same member lifecycle clearly across membership, check-in, PT assignment, and progress.

This change creates a role-aware Member Profile workspace that keeps each route permission-scoped while sharing safe presentation primitives.

## What Changes

- Add a role-aware Member Profile experience for `/staff/members/[id]`, `/admin/members/[id]`, `/pt/members/[id]`, and `/member/profile`.
- Redesign the member profile hierarchy around concise personal info, membership state, check-in rhythm, assigned PT, progress snapshot, and recent activity.
- Keep role-specific actions separate:
  - Staff: check-in, sell package, renew package.
  - Admin: assign PT, manage member, review membership context.
  - PT: trainer note, workout plan, progress review.
  - Member: self-owned membership/progress/training shortcuts only.
- Preserve existing API contracts, query hooks, mutations, mock handlers, and backend business logic.
- Add `/member/profile` as a self-profile route using member-scoped data only.
- Improve loading, empty, error, and permission-aware states for the profile surface.

## Capabilities

### New Capabilities

- `role-aware-member-profile`: Role-aware member profile presentation, route ownership boundaries, allowed action surfaces, and required member lifecycle sections.

### Modified Capabilities

- None.

## Impact

- Affected routes:
  - `src/app/(staff)/staff/members/[id]/page.tsx`
  - `src/app/(admin)/admin/members/[id]/page.tsx`
  - `src/app/(pt)/pt/members/[id]/page.tsx`
  - `src/app/(member)/member/profile/page.tsx`
- Affected feature modules:
  - `src/features/member-360/**`
  - `src/features/staff-front-desk/components/StaffMemberDetailHero.tsx`
  - `src/features/member-progress-tracking/**`
  - `src/features/pt-training/**`
- API behavior: no endpoint, schema, query key, mutation, or backend contract changes.
- Dependencies: no new runtime dependency.
- Tests/checks: targeted typecheck/lint and existing member-360/staff profile tests should remain valid or be updated for the new UI contract.
