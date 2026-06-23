## ADDED Requirements

### Requirement: Audit scope covers app flows and cross-cutting contracts

The audit capability SHALL cover every MVP module/flow and cross-cutting integration risk before recommending implementation fixes.

#### Scenario: Audit scope is initialized

- **WHEN** an audit change is created for GymMaster app/backend alignment
- **THEN** the audit scope includes Auth, role redirect, Member Management, Package/Membership/Payment, Check-in, PT Assignment, PT Training, Member 360, Progress, Nutrition, Dashboard, Audit Log, route coverage, RBAC, API client/session behavior, MSW mocks, and automated tests

#### Scenario: Secondary scope is separated

- **WHEN** a module is secondary or future scope
- **THEN** the audit marks it as secondary/future and does not let it outrank an unresolved MVP blocker unless it affects a shared runtime contract

### Requirement: Findings use evidence-based priority classification

The audit capability SHALL classify each finding with priority, evidence, suspected owner, verification step, and recommended next action.

#### Scenario: Finding is recorded

- **WHEN** the audit identifies a flaw, mismatch, missing contract, or uncertainty
- **THEN** the finding includes `Priority`, `Module/Flow`, `Evidence`, `Risk/Concern`, `Suspected Owner`, `Verification`, and `Recommendation`

#### Scenario: Priority is assigned

- **WHEN** a finding can block login, RBAC/security, core demo workflow, or backend integration
- **THEN** it is classified as `P0` or `P1` according to demo and security impact

### Requirement: Backend alignment separates documented, mocked, and live-verified behavior

The audit capability SHALL distinguish between behavior covered by frontend mocks, documented backend contracts, and live backend verification.

#### Scenario: Mock-only contract is found

- **WHEN** a frontend API path has MSW coverage but no matching backend contract document or live verification
- **THEN** the audit marks the item as a contract gap rather than declaring frontend or backend definitively wrong

#### Scenario: Live backend verification is available

- **WHEN** a live backend response, Swagger/OpenAPI contract, or backend log is available
- **THEN** the audit compares path, method, request payload, response shape, status code, error code, RBAC behavior, and side effects against frontend usage

### Requirement: Review gate blocks implementation fixes

The audit capability SHALL stop at owner review before runtime fixes are implemented.

#### Scenario: Initial matrix is ready

- **WHEN** the initial priority audit matrix is produced
- **THEN** no runtime code is changed and the owner can approve, reorder, or reject follow-up audit/fix tasks

#### Scenario: Owner selects a fix

- **WHEN** the owner approves a specific module/flow for implementation
- **THEN** the implementation work is handled by a separate approved task/change with scoped files and checks

### Requirement: Audit output remains actionable

The audit capability SHALL produce a reviewable matrix and checklist that can become a prioritized backlog.

#### Scenario: Owner reviews the audit

- **WHEN** the owner opens the audit artifacts
- **THEN** they can identify which risks are blockers, which need backend confirmation, which are frontend fixes, and which should be postponed
