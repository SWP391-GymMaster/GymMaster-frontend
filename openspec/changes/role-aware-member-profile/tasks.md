## 1. Profile Workspace Foundation

- [x] 1.1 Inspect current Member 360, Staff detail, member progress, billing check-in, and training query usage.
- [x] 1.2 Create/refactor shared profile presentation sections that accept role-filtered props only.
- [x] 1.3 Add concise loading, empty, error, and unavailable states for the new profile workspace.

## 2. Role-Specific Routes

- [x] 2.1 Migrate Admin member detail route to the role-aware profile workspace with Admin actions.
- [x] 2.2 Migrate PT member detail route to the role-aware profile workspace with PT actions.
- [x] 2.3 Replace Staff member detail UI with a Staff-scoped profile workspace using existing staff detail data.
- [x] 2.4 Add `/member/profile` route with member self-owned profile behavior and Member actions.

## 3. UX Polish

- [x] 3.1 Align desktop layout with GymMaster OS / Apple Health-Fitness inspired hierarchy.
- [x] 3.2 Ensure responsive stacking and accessible action targets for smaller viewports.
- [x] 3.3 Keep runtime copy Vietnamese, concise, and role-specific.

## 4. Validation

- [x] 4.1 Update or add focused tests for role-aware profile actions and self-profile unavailable behavior.
- [x] 4.2 Run targeted typecheck/lint/tests for affected files.
- [x] 4.3 Review OpenSpec status and mark implementation tasks complete.

## 5. Member Social Profile Revision

- [x] 5.1 Redesign `/member/profile` into a social-fitness profile variant without changing Admin/Staff/PT profile layouts.
- [x] 5.2 Keep PT/Staff/Admin access role-scoped through their own member routes instead of linking into `/member/profile`.
- [x] 5.3 Add focused tests for the social profile feed, member-only actions, no cross-role workspace links, and unavailable state.
