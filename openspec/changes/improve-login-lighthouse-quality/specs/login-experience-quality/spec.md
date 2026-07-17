## ADDED Requirements

### Requirement: Measurable production login quality
The frontend SHALL meet the approved mobile production quality budgets for `/login` on the same deployed revision using Lighthouse 13.4.0 with a consistent mobile preset. Acceptance SHALL use three sequential valid runs, SHALL calculate the median Performance, LCP, and TBT, and SHALL use the worst CLS observed across the runs.

#### Scenario: Production Lighthouse acceptance passes
- **WHEN** the three valid mobile Lighthouse runs are completed against the deployed `/login` route
- **THEN** median Performance is at least 85, median LCP is at most 2.5 seconds, median TBT is at most 200 milliseconds, worst CLS is at most 0.1, and every run reports Accessibility 100 with no contrast failure

#### Scenario: A run is invalid or a budget fails
- **WHEN** Lighthouse reports a runtime error, audits different deployed revisions, or any required median, worst-case, or accessibility threshold fails
- **THEN** the production quality gate is not complete and the change MUST NOT be archived as accepted

### Requirement: Responsive decorative media delivery
The login experience SHALL preserve the approved GymMaster OS visual direction while treating the operations cover as optional decorative media. A viewport below the desktop auth breakpoint MUST NOT request the raster operations cover before user interaction, and any desktop cover response used by the login shell MUST be an optimized modern format no larger than 150 KB encoded.

#### Scenario: Mobile user opens login
- **WHEN** `/login` loads at a viewport below the desktop auth breakpoint
- **THEN** the branded gradient and complete login content render without a network request for the raster operations cover

#### Scenario: Desktop user opens login
- **WHEN** `/login` loads at or above the desktop auth breakpoint
- **THEN** the optimized operations cover may render beneath the readability gradient, its encoded response is at most 150 KB, and the form remains legible at every tested crop

#### Scenario: Decorative cover is unavailable
- **WHEN** the optimized cover request fails or images are disabled
- **THEN** the gradient background and login card remain complete, readable, and usable without broken-image text or missing controls

### Requirement: Immediate and stable critical login content
The login heading, description, email/password fields, primary action, and Google-control region SHALL be present in the initial rendered structure without a delayed reveal, mount-only gate, or initial transparent state. Loading external authentication resources MUST NOT move the surrounding form or cause the login route to exceed a CLS of 0.1.

#### Scenario: Initial login content renders
- **WHEN** the server-rendered login response is displayed before client hydration completes
- **THEN** the heading, description, field labels, inputs, primary login action, and dimensionally reserved Google-control region are visible and do not depend on an entrance animation

#### Scenario: Google control becomes ready
- **WHEN** the deferred Google provider replaces its loading placeholder with the official control
- **THEN** the reserved region retains its intended width and height and does not create a material layout shift

#### Scenario: Reduced motion is requested
- **WHEN** the user prefers reduced motion
- **THEN** the login page remains fully usable and no critical content waits for motion to finish

### Requirement: WCAG AA login contrast and focus
All normal-size login text and control labels SHALL have a contrast ratio of at least 4.5:1 against their rendered backgrounds. Meaningful control boundaries and visible focus indicators SHALL have a contrast ratio of at least 3:1 against adjacent colors, and focus MUST remain visible for keyboard users.

#### Scenario: Default light login page is audited
- **WHEN** automated and manual contrast checks inspect the GymMaster OS link, primary login action, form labels, supporting text, errors, and Google states
- **THEN** normal text reaches at least 4.5:1, meaningful non-text boundaries/focus indicators reach at least 3:1, and no contrast violation is reported

#### Scenario: User navigates with the keyboard
- **WHEN** the user tabs through links, inputs, the primary action, and Google control
- **THEN** each interactive element exposes a visible focus indicator and retains readable text in focused, hover, disabled, pending, and error states

### Requirement: Deferred and resilient Google Identity Services
In real Google mode, the frontend SHALL keep Google Identity Services out of the initial critical first-party request path, SHALL initialize it at most once after the critical login UI is interactive or the browser reaches the approved idle boundary, and SHALL preserve the official Google control. Mock/test mode and missing-configuration mode MUST NOT request Google resources.

#### Scenario: Real-mode login reaches first interactive render
- **WHEN** `/login` initially renders with a configured Google client ID and mocking disabled
- **THEN** the complete email/password form and a stable accessible Google loading region render before Google Identity Services becomes a critical dependency

#### Scenario: Real Google initialization succeeds
- **WHEN** the deferred Google script loads successfully
- **THEN** the provider is initialized once, the official Google control replaces the placeholder without a page reload, and a returned credential continues through the existing backend role-aware login flow

#### Scenario: Google script fails
- **WHEN** the deferred provider script or initialization fails
- **THEN** the page keeps email/password login usable and presents a safe Vietnamese retry or error state instead of a permanently empty region

#### Scenario: Mock or missing-configuration mode renders
- **WHEN** API mocking/test mode is active or the Google client ID is absent
- **THEN** the existing mock action or disabled explanatory state renders without injecting the Google Identity Services script

### Requirement: Authentication and PWA contract preservation
The quality change MUST preserve email/password validation, auth-session mutations, safe backend errors, Google credential submission, backend-role redirects, permission guards, and the rule that login has no role picker. It MUST NOT change the PWA manifest, worker registration, cache allowlist, offline fallback, or cache protected/auth/API/Google responses.

#### Scenario: Existing authentication regression suite runs
- **WHEN** focused component and browser tests execute email/password login, mock Google login, invalid credentials, missing role, and all four role redirects
- **THEN** every existing outcome remains unchanged and no role-selection control is present

#### Scenario: PWA cache is inspected after login quality verification
- **WHEN** the production login route and deferred Google control have been exercised under the active GymMaster service worker
- **THEN** Cache Storage contains no Google resource, authentication response, API response, or protected-route document introduced by this change

#### Scenario: Shared auth-shell routes are smoke tested
- **WHEN** login, signup, forgot-password, reset-password, and change-password pages render after the shared shell change
- **THEN** each route retains readable responsive structure, keyboard access, and its existing functional behavior
