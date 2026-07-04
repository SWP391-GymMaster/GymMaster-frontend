# Member Self Profile ("Hồ sơ của tôi")

## Why

Members currently have no way to view or edit their own personal information:

- Signup collects only 4 fields (full name, email, phone, password); first Google login collects nothing and leaves phone empty.
- The member profile row (`member_profiles`) is lazy-created empty at the first package purchase request and stays empty forever — there is no frontend page to fill in date of birth, gender, address, or emergency contact.
- Front-desk check-in looks members up by phone number, so Google-login members are effectively unfindable at the desk until someone fills in their phone.
- The header "avatar" button is a decorative gradient circle that misleadingly opens the theme settings dialog instead of anything account-related.

Backend support already exists (spec 002): `GET/PUT /members/{id}` allow a member to view and edit their own profile (ownership check in `MemberService.CanAccess`). The route `/member/profile` is already reserved in the AGENTS.md route map ("Profile & Settings" = Secondary priority).

Team decision (2026-07-02): profile access is a **basic account right** — it must NOT be gated behind having a membership package.

## What Changes

### Backend (GymMaster-backend repo, `feat/be-part-y-member-flows`)

- Add `GET /api/v1/members/me` — resolve current member profile; **find-or-create** an empty profile row for role Member (same pattern and audit log as `MembershipService.CreateRenewalRequestAsync`). Returns existing `MemberResponse`.
- Add `PUT /api/v1/members/me` — same resolution, then delegates to existing `UpdateAsync` logic (6 editable fields, phone dedup preserved).
- Extract the find-or-create logic into one shared `MemberService` method; `MembershipService.CreateRenewalRequestAsync` calls it too (removes duplication).
- No DB schema change. No change to any existing endpoint.

### Frontend (this repo, `feat/fe-part-y-member-flows`)

- Keep the teammate's social-style view page at `/member/profile` (`src/features/member-360/`) and move this phase's edit form to `/member/profile/edit`.
- New edit page `/member/profile/edit`, **not wrapped in `MembershipGate`** — any authenticated member can access it regardless of package status.
  - Read-only block: email, member code, joined date.
  - Editable form (React Hook Form + Zod): full name, phone, date of birth (no future dates), gender (dropdown), address, emergency contact.
  - Map backend `DUPLICATE` (409) to a field error on phone.
  - Link to existing `/change-password` page.
- The `/member/profile` view links to `/member/profile/edit`, including the empty/unavailable state so a member can complete the lazy-created profile without contacting the front desk.
- After `GET /members/me` responds, sync `session.user.memberProfileId` in the auth store if it was null (lazy-created profile) so billing/nutrition features see the profile immediately.
- Header user button in `WorkspaceShell` becomes a dropdown user menu: "Hồ sơ của tôi" (member role only), "Cấu hình giao diện" (existing `SettingsDialog`), "Đổi mật khẩu", "Đăng xuất". All 4 roles keep working.
- MSW handlers for the 2 new endpoints; unit tests for form + menu per role.

## Capabilities

### New Capabilities

- `member-self-profile`: a member account can always view and edit its own personal profile, independent of membership purchase.

### Modified Capabilities

- `workspace-user-menu`: the header identity button opens a user menu instead of directly opening theme settings.

## Impact

- Backend: `MembersController`, `MemberService`, `IMemberService`, `MembershipService` (reuse extracted helper). Additive only.
- Frontend runtime: `src/app/(member)/member/profile/page.tsx` (view from `member-360`), `src/app/(member)/member/profile/edit/page.tsx` (edit form), `src/features/member-profile/*` (new), `src/components/layout/WorkspaceShell.tsx` (user menu), auth session store (profile id sync), MSW handlers.
- Tests: new unit tests (profile form, user menu per role), MSW contract handlers.
- Semantics: `JoinedAt` may now be set when a member first opens the profile page instead of at first purchase request — flagged to team, accepted (it was already set at request time, before payment).
- Staff/admin member list will show empty profiles for accounts that never purchased — same phenomenon that already exists for unpaid renewal requests, now broader.
- Dashboard metrics: no impact (all counts are based on `Memberships`, verified).
- `MembershipGate`: unchanged behavior; members with a lazy-created profile but no package fall into the existing "no active package" branch.

## Non-Goals

- Avatar upload (phase 2: `avatar_url` column + Cloudinary + header image — separate proposal).
- Email change / email verification (auth-owner scope).
- Self-profile editing for staff/PT/admin (no user-level self-update endpoint exists; separate feature if the team wants it).
- Online food search re-introduction or any nutrition change.
