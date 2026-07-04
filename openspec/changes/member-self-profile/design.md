# Design — Member Self Profile

## Key decisions

### 1. `me` alias endpoints instead of FE calling `/members/{id}` directly

The FE already stores `memberProfileId`, so it *could* call `/members/{id}`. We still add `GET/PUT /members/me` because:

- A fresh account has **no profile row** and therefore no id to call — the whole point of "profile as a basic right" is that this case must work.
- `me/*` is an established route family in `MembersController` (`me/profile-360`, `me/workout-plans`, `me/notes`); `me` next to `{id:long}` cannot collide (route constraint).
- Ownership is implicit — no id in the URL means no IDOR surface for this flow.

### 2. Find-or-create on `me` access (lazy profile creation)

Copied from the accepted pattern in `MembershipService.CreateRenewalRequestAsync` ("mua gói == trở thành hội viên; không còn phụ thuộc admin"):

- Role Member + no `member_profiles` row → create `{ UserId, JoinedAt = UtcNow }`, audit `CREATE_MEMBER { selfService: true }`.
- Extracted into a single shared `MemberService` method; `MembershipService` switches to calling it. One place owns the rule.
- Race safety: `IX_member_profiles_UserId` is a **unique index**, so a concurrent double-create fails at the DB; handle by catching the unique violation and re-querying. No dirty data possible.

### 3. Session sync after lazy creation

`session.user.memberProfileId` is populated at login and is `null` for fresh accounts. After `GET /members/me` returns, if the store value is null, write the returned `Id` into the auth store. Otherwise billing/nutrition/gate features keep treating the user as profile-less until next login.

### 4. Profile page is NOT gated

`/member/profile` renders for any authenticated member. `MembershipGate` continues to gate paid features by membership *status*; it never wraps the profile page. Gate copy for "has profile, no package" already exists and is acceptable.

### 5. Header user menu

`WorkspaceShell` identity button (currently `onClick={() => setSettingsOpen(true)}`) becomes a shadcn `DropdownMenu`:

| Item | Roles | Action |
|---|---|---|
| Hồ sơ của tôi | member only | navigate `/member/profile` |
| Cấu hình giao diện | all | open existing `SettingsDialog` |
| Đổi mật khẩu | all | navigate `/change-password` |
| Đăng xuất | all | existing logout flow |

`SettingsDialog` itself is unchanged. The decorative gradient circle stays for now (real avatar image is phase 2).

### 6. Validation split

BE validation is thin (free-text gender, no DOB range). FE form enforces: DOB ≤ today, gender via dropdown (values consistent with admin member form), phone format. BE is unchanged in this change — tightening BE validation is optional hardening, not required.

## Out of scope (phase 2 pointer)

Avatar upload: `users.avatar_url NVARCHAR(500) NULL` (script `012_...`), `CloudinaryDotNet`, `POST /members/{id}/avatar`, header renders image with initials fallback. Requires team approval for the new package + column.
