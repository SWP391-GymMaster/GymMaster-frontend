## ADDED Requirements

### Requirement: Desktop visual cohesion
The frontend SHALL provide a cohesive desktop visual system for all implemented protected role workspaces in light mode with lime accent, including the command rail, top command area, content canvas, cards, action panels, and dialogs.

#### Scenario: Light lime desktop route is visually cohesive
- **WHEN** a user views any implemented admin, staff, PT, or member route on a desktop viewport
- **THEN** the command rail, top bar, and content surfaces MUST feel like one product surface with sufficient contrast, consistent spacing, and restrained accent usage

#### Scenario: Role surfaces remain distinguishable
- **WHEN** a user switches between admin, staff, PT, and member workspaces through separate authenticated sessions
- **THEN** each workspace MUST keep its role context visible without introducing a role picker or role switcher

### Requirement: Business behavior preservation
The UX/UI rework SHALL preserve existing business logic, route paths, API contracts, mock handlers, TanStack Query behavior, auth session handling, and role permission rules.

#### Scenario: Existing role login flow still redirects by backend role
- **WHEN** a user logs in with a valid mock account
- **THEN** the frontend MUST redirect to the dashboard route determined by the authenticated role returned by the auth response

#### Scenario: Protected route behavior is unchanged
- **WHEN** an authenticated user visits a route outside their allowed role
- **THEN** the app MUST show the existing permission-denied behavior and MUST NOT expose another role's workspace data

### Requirement: Concise Vietnamese runtime copy
The frontend SHALL use concise, product-quality Vietnamese runtime copy for changed desktop screens and shared UI components.

#### Scenario: Primary screen copy is concise
- **WHEN** a desktop route is migrated under this rework
- **THEN** headings, descriptions, labels, helper text, empty states, and action text MUST be short, specific, and free of implementation jargon unless the screen is explicitly technical

#### Scenario: Broken Vietnamese encoding is removed
- **WHEN** shared navigation, shell, auth, dialog, or role workspace copy is rendered after the rework
- **THEN** the UI MUST NOT display mojibake or corrupted Vietnamese text

### Requirement: Desktop layout stability
The frontend SHALL use stable desktop layouts for cards, grids, forms, dialogs, wizards, and metric surfaces so text and controls do not overlap, drift, or resize awkwardly.

#### Scenario: Card groups align optically
- **WHEN** a route displays repeated cards, pricing/package panels, metric summaries, or wizard status cards
- **THEN** related titles, metrics, descriptions, and CTAs MUST align consistently and preserve stable dimensions across the group

#### Scenario: Dialog fields remain readable
- **WHEN** a user opens a dialog or modal on desktop
- **THEN** labels, inputs, buttons, and validation messages MUST have readable spacing and no clipped or overlapping text

### Requirement: Apple Health/Fitness-inspired role experience
The desktop rework SHALL use Apple Health/Fitness-inspired hierarchy patterns where appropriate, including calm daily summaries, health metric emphasis, progress/ring-style visual language, and clear next actions.

#### Scenario: Member health routes emphasize daily action
- **WHEN** a member views dashboard, nutrition, progress, workout, or membership routes
- **THEN** the screen MUST prioritize today's status, next action, key metric, and supporting detail in a calm fitness-oriented hierarchy

#### Scenario: Operations routes remain efficient
- **WHEN** admin, staff, or PT users view operational routes
- **THEN** the screen MUST remain efficient for scanning, comparison, and repeated action rather than becoming a marketing-style layout

### Requirement: Interaction and accessibility preservation
The UX/UI rework SHALL preserve accessible names, visible focus states, keyboard-usable controls, hover/active states, reduced-motion safety, and readable status text.

#### Scenario: Interactive controls remain accessible
- **WHEN** a user navigates controls with keyboard or pointer
- **THEN** buttons, links, inputs, tabs, filters, and dialogs MUST keep accessible names, visible focus states, hover states, and active feedback

#### Scenario: Status is not color-only
- **WHEN** the UI presents account, payment, membership, assignment, nutrition, or check-in state
- **THEN** the state MUST include readable text and MUST NOT rely on color alone

### Requirement: Screenshot-driven desktop validation
The project SHALL maintain a Playwright baseline capture flow for all implemented desktop routes in mock mode.

#### Scenario: Baseline screenshots cover all implemented desktop routes
- **WHEN** the screenshot capture target is run in MSW mock mode
- **THEN** it MUST capture public/auth/admin/staff/PT/member implemented routes and key interaction states without route failures

#### Scenario: Rework is reviewed against baseline
- **WHEN** a desktop UI slice is changed
- **THEN** the team MUST rerun the screenshot capture target or an equivalent route screenshot check before approving merge

### Requirement: Mobile and tablet preservation
The desktop-first rework SHALL avoid intentional mobile/tablet redesign and SHALL preserve existing responsive behavior unless explicitly approved later.

#### Scenario: Shared component changes do not break mobile navigation
- **WHEN** shared shell or card components are modified for desktop
- **THEN** mobile command navigation, touch target sizing, and responsive route access MUST remain usable
