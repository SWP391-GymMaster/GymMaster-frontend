## ADDED Requirements

### Requirement: Evidence-based CSS boundary feasibility
The frontend team SHALL preserve a same-revision production baseline and SHALL NOT edit tracked runtime CSS or layout files until generated stylesheet attribution and representative browser CSS coverage demonstrate a conservative opportunity to remove at least 10 KiB gzip and at least 25% of first-party `/login` stylesheet transfer.

#### Scenario: Feasibility threshold is met
- **WHEN** baseline coverage across required auth, responsive, focus, validation, provider, reduced-motion, theme, and print states identifies a safely separable workspace-only CSS boundary meeting both thresholds
- **THEN** one route-scoped CSS proof of concept may proceed under the remaining Gate C requirements

#### Scenario: Feasibility threshold is not met
- **WHEN** the conservative separable CSS estimate misses either threshold or deterministic layer ownership cannot be established
- **THEN** Gate C is recorded as infeasible, no tracked runtime file is changed, and login Lighthouse experimentation stops

### Requirement: Single route-scoped CSS proof
When feasible, the frontend SHALL evaluate only one local explicit-source Tailwind CSS boundary that keeps theme, Preflight, shared tokens, and global base behavior root-owned while delivering auth and workspace utilities through deterministic layout-owned stylesheets. The proof MUST NOT change authentication, route behavior, API contracts, service-worker behavior, user-facing copy, dependencies, fonts, or visual design requirements.

#### Scenario: Candidate build is generated
- **WHEN** the Gate C source boundary is applied
- **THEN** the production build contains no duplicated Preflight/theme layer, `/login` excludes the measured workspace-only utility payload, and every route retains the required styles after direct load and client navigation

#### Scenario: CSS ownership is ambiguous
- **WHEN** the candidate requires component-level global imports, duplicated base layers, unreliable stylesheet ordering, or a second architectural alternative
- **THEN** the proof is rejected and all candidate runtime changes are restored

### Requirement: Gate C retention budgets
The frontend SHALL retain the Gate C candidate only when three comparable valid Lighthouse 13.4.0 mobile runs improve median LCP by at least 10%, do not reduce median Performance, reduce first-party stylesheet transfer by at least 25%, keep encoded `/login` HTML at or below 50 KiB, and keep total first-load transfer within 5% of baseline. Accessibility SHALL be 100 in every run, TBT and CLS MUST NOT regress beyond the existing acceptance budgets, and all representative auth/workspace, responsive, PWA, cache-privacy, typecheck, lint, unit, and browser tests MUST pass.

#### Scenario: Every retention criterion passes
- **WHEN** the candidate satisfies every byte, Lighthouse, visual, behavior, accessibility, and privacy criterion
- **THEN** it remains unstaged for owner review and is not deployed until separately approved

#### Scenario: Any retention criterion fails
- **WHEN** any comparison is invalid or any required criterion fails
- **THEN** every Gate C runtime/test-helper change is automatically reverted, the restored production build is verified, and only evidence plus planning notes remain for review

### Requirement: Terminal optimization stop
A failed or infeasible Gate C SHALL end this login Lighthouse optimization stream. The team MUST NOT create or apply a Gate D before repository finalization, Graphify refresh, owner diff review, and the separately approved safe publication of current `main` work.

#### Scenario: Gate C is rejected
- **WHEN** the feasibility or retention decision rejects Gate C
- **THEN** the result is documented as terminal and the next proposed workflow is repository finalization rather than another performance micro-experiment
