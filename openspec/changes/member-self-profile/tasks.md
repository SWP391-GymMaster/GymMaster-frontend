# Tasks — Member Self Profile

## 0. Approval

- [x] Proposal approved by owner (user Y) — required before any code
- [ ] Team informed: JoinedAt semantics + empty profiles visible in staff/admin member list

## 1. Backend (GymMaster-backend, branch `feat/be-part-y-member-flows`)

- [x] `MemberService`: extract shared `GetOrCreateCurrentProfileAsync(principal)` (find-or-create + audit `CREATE_MEMBER { selfService: true }`, unique-violation safe)
- [x] `MembershipService.CreateRenewalRequestAsync`: replace inline lazy-create with the shared method
- [x] `MembersController`: `GET /members/me` → resolve/create then existing `GetByIdAsync`
- [x] `MembersController`: `PUT /members/me` → resolve/create then existing `UpdateAsync`
- [ ] Manual smoke: fresh member account → GET me creates empty profile; PUT me edits 6 fields; phone dedup still 409; staff/admin/PT untouched

## 2. Frontend (this repo, branch `feat/fe-part-y-member-flows`)

- [x] `src/features/member-profile/api/member-profile.api.ts` + `member-profile.queries.ts` (`useMyProfile`, `useUpdateMyProfile`, PascalCase→camelCase mapping per convention)
- [x] Auth store: sync `memberProfileId` from `GET /members/me` response when null
- [x] `src/features/member-profile/components/MemberProfileWorkspace.tsx` — read-only block (email, member code, joined date) + RHF/Zod form (fullName, phone, dateOfBirth ≤ today, gender dropdown, address, emergencyContact), 409 → phone field error, loading/error/empty states, Vietnamese copy
- [x] View/edit split after merging main: `/member/profile` renders the `member-360` social view, while `src/app/(member)/member/profile/edit/page.tsx` renders `MemberProfileWorkspace` (NO MembershipGate)
- [x] `/member/profile` view links to `/member/profile/edit`; unavailable state keeps informational copy and offers a lazy-create completion CTA
- [x] Member navigation and user menu keep `/member/profile` as the view entry point
- [x] `WorkspaceShell`: identity button → DropdownMenu (Hồ sơ của tôi [member only] / Cấu hình giao diện / Đổi mật khẩu / Đăng xuất); SettingsDialog unchanged
- [x] MSW: handlers for `GET/PUT /members/me` (+ contract test entries)

## 3. Tests

- [x] Unit: profile form renders, validates DOB/phone, submits partial update, maps 409 to phone error
- [x] Unit: user menu shows "Hồ sơ của tôi" only for member role; theme dialog still opens for all 4 roles
- [x] Contract: MSW handlers match `MemberResponse` shape
- [x] `npm run typecheck` + `npm run lint` + `npm run test` pass

## 4. Wrap-up

- [ ] Update `docs/backend` contract notes with the 2 new endpoints (if the team keeps that folder current)
- [ ] Push both branches; PR checklists per repo rules
- [ ] `openspec archive member-self-profile` after merge
