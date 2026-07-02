## ADDED Requirements

### Requirement: Role-specific member profile routes

The frontend SHALL provide a Member Profile workspace for Admin, Staff, PT, and Member routes while preserving route-level ownership and role boundaries.

#### Scenario: Staff opens member profile

- **WHEN** a Staff user opens `/staff/members/[id]`
- **THEN** the screen SHALL show a staff-scoped member profile with personal info, membership state, recent check-ins, and Staff actions only

#### Scenario: Admin opens member profile

- **WHEN** an Admin user opens `/admin/members/[id]`
- **THEN** the screen SHALL show personal info, membership state, check-in context, assigned PT, progress context, and Admin actions only

#### Scenario: PT opens assigned member profile

- **WHEN** a PT user opens `/pt/members/[id]` for an assigned member
- **THEN** the screen SHALL show personal info, membership state, check-in context, assigned PT context, progress context, and PT coaching actions only

#### Scenario: Member opens self profile

- **WHEN** a Member user opens `/member/profile`
- **THEN** the screen SHALL show only that member's self-owned profile, membership, assigned PT, progress, and training shortcuts

### Requirement: Role-aware action surface

The Member Profile workspace SHALL render actions according to the current route role and SHALL NOT show actions outside that role's allowed workflow.

#### Scenario: Staff actions

- **WHEN** the profile is rendered in Staff context
- **THEN** available actions SHALL be limited to check-in, sell package, and renew package workflow links

#### Scenario: Admin actions

- **WHEN** the profile is rendered in Admin context
- **THEN** available actions SHALL be limited to admin management, PT assignment, and membership workflow links

#### Scenario: PT actions

- **WHEN** the profile is rendered in PT context
- **THEN** available actions SHALL be limited to trainer note, workout plan, and progress review workflow links for that member

#### Scenario: Member actions

- **WHEN** the profile is rendered in Member context
- **THEN** available actions SHALL be limited to self-service membership, progress, workout, and trainer note viewing links

### Requirement: Member lifecycle summary sections

The Member Profile workspace SHALL prioritize personal info, membership, check-in, assigned PT, and progress information in a concise operational layout.

#### Scenario: Profile data is available

- **WHEN** profile data loads successfully
- **THEN** the screen SHALL render identity/status, membership summary, check-in rhythm or timeline, assigned PT status, progress snapshot, and recent activity using concise Vietnamese labels

#### Scenario: Staff data is narrower than 360 data

- **WHEN** Staff member detail data does not include PT or progress fields
- **THEN** the screen SHALL avoid fake PT/progress values and SHALL only show staff-available sections plus safe unavailable states when useful

### Requirement: Loading empty error states

The Member Profile workspace SHALL provide clear loading, empty, error, and unavailable states for each route context.

#### Scenario: Profile is loading

- **WHEN** a profile query is pending
- **THEN** the screen SHALL show a stable loading state without layout collapse

#### Scenario: Profile cannot be loaded

- **WHEN** a profile query fails
- **THEN** the screen SHALL show a readable error state with a retry affordance when the route wrapper provides retry

#### Scenario: Member self identity is unavailable

- **WHEN** `/member/profile` cannot resolve the current member profile identity
- **THEN** the screen SHALL show a safe unavailable state and SHALL NOT query or render another member's profile as fallback

### Requirement: Apple Health/Fitness-inspired desktop UX

The Member Profile workspace SHALL follow GymMaster OS visual direction with Apple Health/Fitness-inspired hierarchy where appropriate.

#### Scenario: Desktop profile view

- **WHEN** the profile is viewed on desktop
- **THEN** the screen SHALL use cohesive mist/chalk surfaces, restrained lime accents, clear metric hierarchy, soft rings or compact stat cards, and unified sidebar/content feel

#### Scenario: Responsive profile view

- **WHEN** the profile is viewed on smaller widths
- **THEN** the screen SHALL stack profile sections into readable cards with tap-friendly actions and no desktop-only dense table layout

### Requirement: Member self social profile variant

The Member self profile route SHALL present the profile as a private social-fitness profile rather than a generic operational dashboard.

#### Scenario: Member views self profile as social fitness feed

- **WHEN** a Member opens `/member/profile`
- **THEN** the screen SHALL show a cover/profile header, large avatar, concise bio, membership badge, compact social stats, segmented profile tabs, and private activity feed cards

#### Scenario: Internal staff roles need profile access

- **WHEN** PT, Staff, or Admin need to view a member profile
- **THEN** the frontend SHALL keep them on role-scoped member routes and SHALL NOT route them into the Member self-owned `/member/profile` page
