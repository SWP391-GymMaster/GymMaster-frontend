# Tasks — Account Self-Service + Avatar

## 0. Prerequisites

- [ ] Team informed: profile merge plan (view `/member/profile` + edit `/member/profile/edit`), CloudinaryDotNet package, AvatarUrl column, touches to anhdaijka's components
- [ ] Cloudinary secrets set locally via user-secrets (owner does this; never committed)

## 1. FE merge (Codex Prompt 1, branch `feat/fe-part-y-member-flows`)

- [ ] Merge `origin/main` into branch; 8 repair files → main's version
- [ ] `WorkspaceShell` + `CommandRail` + `workspace-shell.test` → main's version
- [ ] `/member/profile` = main's view page; phase-1 edit form moved to `/member/profile/edit`
- [ ] View page: "Chỉnh sửa hồ sơ" action; dead-end "liên hệ lễ tân" → CTA to edit page (lazy-create)
- [ ] `member-self-profile` openspec docs updated (route) + committed
- [ ] Gates: typecheck + lint + test pass

## 2. Backend (Codex Prompt 2, branch `feat/be-part-y-member-flows`)

- [ ] `database/012_users_avatarurl.sql` (idempotent; committed, NOT executed)
- [ ] `User.AvatarUrl`; `AvatarUrl` in `AuthUserResponse`, `MemberResponse`, Profile360 identity
- [ ] `CloudinaryOptions` + `IAvatarStorage` + `CloudinaryAvatarStorage` (256×256 face crop, overwrite per user)
- [ ] `AccountController`: `PUT /users/me` (name/phone + dedup) + `POST /users/me/avatar` (type/size validation)
- [ ] Google first login sets AvatarUrl from payload picture
- [ ] `dotnet build` + tests green (fix MemberResponse ctor usages)

## 3. FE avatar/account (Codex Prompt 3, branch `feat/fe-part-y-member-flows`)

- [ ] shadcn `avatar.tsx` + shared `UserAvatar` (image/initials fallback) — adopts orphaned radix package
- [ ] "Tài khoản của tôi" dialog (all roles): avatar upload + name + phone + change-password link
- [ ] User menu item for the dialog; header circle renders real avatar
- [ ] `MemberSocialProfile` identity block shows avatar; member edit page reuses upload control
- [ ] Session store `avatarUrl` (login + after upload); MSW handlers; tests per role
- [ ] Gates: typecheck + lint + test pass

## 4. Review & wrap-up

- [ ] Claude cross-review both repos + run all gates
- [ ] Manual smoke with real Cloudinary (owner provides secrets)
- [ ] Run `database/012` on dev DB (owner/team, manual)
- [ ] Push both branches — ONLY on owner's explicit order
- [ ] `openspec archive` both changes after merge
