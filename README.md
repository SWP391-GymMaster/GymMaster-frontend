# GymMaster Frontend

GymMaster frontend implementation for the gym management system specified in `docs/init/`.

This repository is frontend-only. It implements the Next.js UI, frontend routes, role-aware workspaces, API client integration, state handling, forms, validation, responsive UX, and frontend tests for GymMaster.

## Source of Truth

Read in this order:

1. `AGENTS.md` — agent rules and non-negotiable frontend constraints.
2. `docs/init/` — full-system GymMaster product scope, roles, use cases, requirements, roadmap, and API expectations.
3. `docs/backend/` — backend feature specs, auth API details, RBAC rules, response shapes, error codes, and endpoint contracts for frontend integration/mocking.
4. `docs/design/` — frontend UX/UI, route map, component, architecture, workflow, and testing guidance derived from `docs/init`.
5. Current code/config — what is actually implemented today.

Backend, database, authentication server, storage, notification, Azure, and AI Vision details in `docs/init/` and `docs/backend/` are external contracts for this frontend repo.

## Current Status

Current implementation includes no-role-picker auth, backend-role redirect normalization, protected role workspaces, Admin/Staff/member/PT management surfaces, Staff sell/renew/check-in flows, Admin PT assignment, PT workout/notes, Member nutrition, MSW-backed frontend contracts, Vitest coverage, and Playwright demo flows. Live backend validation is still pending.

Current scripts:

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run test:e2e:ui
```

Unit/component testing is configured with Vitest, React Testing Library, jest-dom, and jsdom. Playwright E2E is configured for mock-mode demo flows. Storybook remains planned only.

The external backend contract is ASP.NET Core 8 Web API + SQL Server + EF Core 8 Code First, per final `docs/init/`.

Final runtime UI target is Vietnamese. Some implemented screens still contain English copy from earlier MVP work and need a dedicated copy migration before demo freeze.

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
