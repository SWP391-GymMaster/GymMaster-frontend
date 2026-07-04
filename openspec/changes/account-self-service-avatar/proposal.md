# Account Self-Service + Avatar (Phase 2)

## Why

Phase 1 (`member-self-profile`) gave members a self-service profile. Two gaps remain, and both read as "half-built" in a defense demo:

1. **No avatar anywhere.** The header identity circle is a decorative gradient; the new social-style member profile view (merged to main by anhdaijka, `c4e7b6c`) has no profile picture either. `@radix-ui/react-avatar` sits orphaned in `package-lock.json` — installed, never used.
2. **Staff/PT/Admin have zero self-service.** They get a user menu but cannot change even their own display name, phone, or picture. Big-app convention (Slack, MS Teams, ASP.NET Identity's own Manage Account scaffold) is: every signed-in user manages basic account info; org-controlled data stays locked.

Team goal for this phase: project completeness for the council defense — no dead ends, no created-but-unused artifacts.

## What Changes

### Model: two tiers

- **Account tier** (`users` table — every role): avatar, full name, phone. Self-editable.
- **Customer tier** (`member_profiles` — member only): DOB, gender, address, emergency contact. Already done in phase 1.
- Still locked: email (no email infrastructure for verification), role/status (admin-only).

### Prerequisite merge (FE)

Merge `origin/main` into `feat/fe-part-y-member-flows` resolving the known 12-file overlap:
- 8 repair files → take main's version.
- `WorkspaceShell` / `CommandRail` / `workspace-shell.test` → take main's (anhdaijka's richer menu).
- `/member/profile` → main's view page stays; phase-1 edit form moves to **`/member/profile/edit`**; view page gains "Chỉnh sửa hồ sơ" action; the "contact front desk" dead-end is replaced by a CTA to the edit page (which lazy-creates via `GET /members/me`).

### Backend (GymMaster-backend)

- DB script `database/012_users_avatarurl.sql`: `ALTER TABLE dbo.users ADD AvatarUrl NVARCHAR(500) NULL` (idempotent, matches prior script style). **Script is committed, not executed — run manually per database/README.**
- `User.AvatarUrl` entity field; `AvatarUrl` added to `AuthUserResponse`, `MemberResponse`, and the Profile360 identity block.
- New `AccountController` at `api/v1/users/me` (plain `[Authorize]`, all roles — keeps admin-only `UsersController` untouched):
  - `PUT /users/me` — FullName, Phone (reuse existing normalize + duplicate-phone rules).
  - `POST /users/me/avatar` — multipart image (jpeg/png/webp, ≤ 5 MB) → Cloudinary → save URL.
- `IAvatarStorage` abstraction + `CloudinaryAvatarStorage` (transformation: 256×256 fill, gravity face; folder `gymmaster/avatars`; public_id = `user_{id}`, overwrite — re-upload replaces the old image, no orphan files).
- `CloudinaryOptions` bound from config `Cloudinary:*` (user-secrets/env); unconfigured → `CLOUDINARY_NOT_CONFIGURED` error, mirroring the Google options pattern.
- New NuGet dependency: `CloudinaryDotNet` (team approval requested alongside this proposal).
- Google first login: set `AvatarUrl` from the verified Google payload picture.

### Frontend (GymMaster-Frontend)

- shadcn `Avatar` component (`src/components/ui/avatar.tsx`) — adopts the orphaned `@radix-ui/react-avatar` as a real, used dependency. Shared `UserAvatar` wrapper: image when `avatarUrl`, initials fallback otherwise.
- **"Tài khoản của tôi" dialog** — opened from the user menu, all 4 roles: avatar preview + upload, full name, phone, link to `/change-password`. Uses `PUT /users/me` + `POST /users/me/avatar`.
- Header identity circle renders the real avatar (fallback initials).
- Member profile view page shows the avatar in its identity block (minimal touch to `MemberSocialProfile`); member edit page reuses the same upload control — one component, no duplication.
- Auth session store: `avatarUrl` on the session user, updated after login (`/auth/me`) and after upload.
- MSW handlers + tests for the new endpoints and role-based dialog behavior.

## Impact

- BE: 1 new column (nullable — zero data migration), 1 new controller, 1 new service + options, 3 DTOs extended, 1 package. Existing endpoints unchanged.
- FE: merge resolution (12 files, recipe above), 1 dialog, 1 shared avatar component, header + view-page touch-ups.
- Touches anhdaijka's components (`MemberSocialProfile`, `WorkspaceShell` menu) — coordination announced to team before merge/push.
- Cloud dependency: Cloudinary free tier (~10 MB total for hundreds of avatars vs 25 GB quota).

## Non-Goals

- Email change (needs email-sending infrastructure first).
- 2FA, session management, self-service account deletion.
- Staff/PT editing of professional records (`trainer_profiles` stays admin-managed).
- Any nutrition/billing/progress change.
