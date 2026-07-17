## ADDED Requirements

### Requirement: Installable GymMaster manifest
The frontend SHALL expose a standards-compliant web app manifest that identifies GymMaster, uses the GymMaster OS brand palette, launches from the existing root entry point, uses standalone display mode, and references purpose-appropriate 192x192 and 512x512 PNG icons including a maskable option. The manifest MUST NOT change authentication, role detection, or role-based navigation behavior.

#### Scenario: Browser retrieves the manifest
- **WHEN** a supported browser requests the production manifest
- **THEN** it receives valid manifest metadata with GymMaster name, short name, description, start URL, scope, standalone display mode, theme/background colors, and valid icon references

#### Scenario: Installed app launches
- **WHEN** a user opens an installed GymMaster app
- **THEN** the app starts at `/`, follows the existing `/welcome` and authentication flow, and does not expose a role picker or bypass a permission guard

### Requirement: Contextual installation experience
The frontend SHALL offer a Vietnamese, accessible, dismissible installation action on the existing role profile surfaces when the browser reports installation eligibility. It SHALL show platform-appropriate manual Add to Home Screen guidance on supported iOS devices, remain hidden in standalone mode, and MUST NOT interrupt login, check-in, package sale/renewal, payment, or other critical operations.

#### Scenario: Chromium installation is available
- **WHEN** an eligible user visits a role profile in a supported browser and the `beforeinstallprompt` event is available
- **THEN** the app presents a non-modal install action and invokes the captured browser prompt only after the user activates it

#### Scenario: iOS requires manual installation
- **WHEN** an eligible iOS user visits a role profile outside standalone mode
- **THEN** the app presents concise Vietnamese instructions for using Share and Add to Home Screen without claiming that installation can be started programmatically

#### Scenario: App is already installed or prompt was dismissed
- **WHEN** GymMaster is running in standalone mode or the user has dismissed the install action for the current release
- **THEN** the install action is not shown and no modal interrupts the current workflow

### Requirement: Isolated service-worker lifecycle
The frontend SHALL register one GymMaster application service worker at `/sw.js` with root scope only in a production browser context where API mocking is disabled. The application PWA worker and the MSW mock worker MUST NOT control the same client at the same time, and development/test startup with API mocking enabled SHALL remove any stale GymMaster PWA registration and its versioned caches before starting MSW.

#### Scenario: Production registration
- **WHEN** the production client loads on a secure origin with API mocking disabled and service workers are supported
- **THEN** it registers `/sw.js` with scope `/` without starting the MSW browser worker

#### Scenario: Mock API development session
- **WHEN** the client loads with `NEXT_PUBLIC_API_MOCKING=enabled`
- **THEN** it does not register the PWA worker, removes only stale GymMaster PWA registrations/caches, and allows `mockServiceWorker.js` to start normally

#### Scenario: Service workers are unsupported
- **WHEN** the browser does not expose the Service Worker API
- **THEN** the app continues as an online web application without presenting PWA lifecycle errors to the user

### Requirement: Privacy-preserving cache allowlist
The service worker SHALL use versioned GymMaster cache names and cache only explicitly approved, same-origin public shell assets such as the offline document, PWA icons, brand assets, and immutable Next.js static build assets. It MUST bypass all non-GET requests, API routes, authentication traffic, user-specific documents, React Server Component requests, payment/check-in/membership operations, and cross-origin resources unless a future approved spec explicitly adds them.

#### Scenario: Public static asset is requested
- **WHEN** an allowlisted same-origin static asset is requested
- **THEN** the service worker may satisfy it from the versioned cache and refresh or populate the cache according to the defined static-asset strategy

#### Scenario: Protected API data is requested
- **WHEN** a request targets `/api`, an authenticated backend endpoint, or contains a non-GET method
- **THEN** the service worker passes the request directly to the network and stores neither the request nor its response in a PWA cache

#### Scenario: A new worker version activates
- **WHEN** a newly approved cache version becomes active
- **THEN** the worker deletes obsolete caches whose names use the GymMaster PWA prefix and retains unrelated browser/MSW storage

### Requirement: Honest offline behavior
The frontend SHALL provide a branded Vietnamese offline fallback for failed document navigations and a visible, accessible connectivity state for an already-open application. The PWA MUST NOT queue writes, synthesize success, or present stale protected data as newly confirmed while offline.

#### Scenario: Navigation fails while offline
- **WHEN** a browser-controlled document navigation cannot reach the network
- **THEN** the service worker returns the pre-cached GymMaster offline document with a retry action and no protected member, payment, membership, or check-in data

#### Scenario: Active session loses connectivity
- **WHEN** an open GymMaster screen receives the browser offline event
- **THEN** a Vietnamese connectivity notice appears without obscuring the workspace and disappears after connectivity returns

#### Scenario: User attempts an online-only mutation while offline
- **WHEN** an API mutation fails because the device is offline
- **THEN** the existing mutation error path reports failure and the PWA neither queues the operation nor shows a success confirmation

#### Scenario: Legacy simulated queue is present
- **WHEN** an upgraded client contains the obsolete `gymmaster-offline-queue` key or the user records water locally
- **THEN** the obsolete queue is removed, water history remains explicitly device-local, and the frontend does not claim that a backend synchronization succeeded

### Requirement: User-controlled application updates
The frontend SHALL detect a waiting GymMaster service-worker update and present a non-blocking Vietnamese update notice. It MUST reload only after explicit user confirmation and SHALL keep the current page usable when the update is deferred.

#### Scenario: Updated worker is waiting
- **WHEN** a new service worker reaches the waiting state for an already controlled client
- **THEN** the app offers an accessible update action without automatically reloading the page

#### Scenario: User accepts the update
- **WHEN** the user activates the update action
- **THEN** the waiting worker is instructed to activate and the page reloads once after the new worker takes control

#### Scenario: User defers the update
- **WHEN** the user dismisses or ignores the update notice
- **THEN** the current client remains usable and no in-progress form or operation is discarded automatically

### Requirement: PWA response security and verification
The frontend SHALL serve the service worker with JavaScript content type, no-cache/no-store revalidation semantics, a self-only script policy, and MIME-sniffing protection. Automated and manual verification SHALL cover the manifest, icon responses, production registration, offline fallback, update prompt, MSW coexistence, and exclusion of protected requests from caches.

#### Scenario: Browser fetches the service worker
- **WHEN** `/sw.js` is requested
- **THEN** the response includes the approved content type, cache-control, content-security-policy, and `X-Content-Type-Options` headers

#### Scenario: PWA acceptance suite runs
- **WHEN** the production-build PWA verification suite and browser checklist are executed
- **THEN** all required installability/offline/update cases pass and inspection confirms that no authenticated API or mutation response exists in a GymMaster PWA cache
