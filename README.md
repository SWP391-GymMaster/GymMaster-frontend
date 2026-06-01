# GymMaster Frontend

GymMaster frontend implementation for the gym management system specified in `docs/init/`.

This repository is frontend-only. It implements the Next.js UI, frontend routes, role-aware workspaces, API client integration, state handling, forms, validation, responsive UX, and frontend tests for GymMaster.

## Source of Truth

Read in this order:

1. `AGENTS.md` — agent rules and non-negotiable frontend constraints.
2. `docs/init/` — full-system GymMaster product scope, roles, use cases, requirements, roadmap, and API expectations.
3. `docs/design/` — frontend UX/UI, route map, component, architecture, workflow, and testing guidance derived from `docs/init`.
4. Current code/config — what is actually implemented today.

Backend, database, authentication server, storage, notification, Azure, and AI Vision details in `docs/init/` are external contracts for this frontend repo.

## Current Status

Current implementation is still a minimal Next.js starter with Tailwind CSS and initial shadcn-style UI wiring. GymMaster frontend features are not implemented yet.

Current scripts:

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
```

Test, E2E, and Storybook scripts are planned but not installed/configured yet.

## Product Summary

GymMaster supports four roles:

- Admin
- Staff
- PT
- Member

MVP flow:

```text
Login
→ member/profile management
→ sell/renew membership
→ check-in
→ assign PT
→ workout plan and trainer notes
→ progress and meal journal
→ dashboard and audit log
```

## Important Rules

- Use npm.
- Do not add a role picker to login.
- Backend determines role after authentication.
- Frontend redirects by authenticated user role.
- Do not add backend/database source code to this repo unless scope is explicitly changed.
