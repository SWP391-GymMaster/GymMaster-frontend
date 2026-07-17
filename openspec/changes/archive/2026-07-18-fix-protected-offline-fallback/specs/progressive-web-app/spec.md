## MODIFIED Requirements

### Requirement: Honest offline behavior
The frontend SHALL provide a branded Vietnamese offline fallback for failed document navigations and a visible, accessible connectivity state for an already-open application. A browser-controlled protected document navigation SHALL receive the offline document only when its network request genuinely fails; a successful online authentication or permission response MUST remain authoritative. The PWA MUST NOT queue writes, synthesize success, or present stale protected data as newly confirmed while offline.

#### Scenario: Navigation fails while offline
- **WHEN** a browser-controlled document navigation, including a navigation to a protected route, cannot reach the network
- **THEN** the service worker returns the pre-cached GymMaster offline document with a retry action and no protected member, payment, membership, or check-in data

#### Scenario: Online protected navigation returns an auth response
- **WHEN** a protected document navigation successfully receives an unauthenticated or permission-denied application response
- **THEN** the frontend renders that response and does not replace it with the offline document merely because a connectivity hint reports offline

#### Scenario: Active session loses connectivity
- **WHEN** an open GymMaster screen receives the browser offline event
- **THEN** a Vietnamese connectivity notice appears without obscuring the workspace and disappears after connectivity returns

#### Scenario: User attempts an online-only mutation while offline
- **WHEN** an API mutation fails because the device is offline
- **THEN** the existing mutation error path reports failure and the PWA neither queues the operation nor shows a success confirmation

#### Scenario: Legacy simulated queue is present
- **WHEN** an upgraded client contains the obsolete `gymmaster-offline-queue` key or the user records water locally
- **THEN** the obsolete queue is removed, water history remains explicitly device-local, and the frontend does not claim that a backend synchronization succeeded

### Requirement: PWA response security and verification
The frontend SHALL serve the service worker with JavaScript content type, no-cache/no-store revalidation semantics, a self-only script policy, and MIME-sniffing protection. Automated and manual verification SHALL cover the manifest, icon responses, production registration, controlled failed-document offline fallback, live connectivity state, update prompt, MSW coexistence, and exclusion of protected requests from caches. Browser verification MUST distinguish a returned offline document from an online application document that renders an authentication guard.

#### Scenario: Browser fetches the service worker
- **WHEN** `/sw.js` is requested
- **THEN** the response includes the approved content type, cache-control, content-security-policy, and `X-Content-Type-Options` headers

#### Scenario: PWA acceptance suite runs
- **WHEN** the production-build PWA verification suite and browser checklist are executed
- **THEN** all required installability, controlled offline navigation, live connectivity, and update cases pass; the navigation response is proven to be the branded offline document after a genuine network failure; and inspection confirms that no authenticated API, protected document, or mutation response exists in a GymMaster PWA cache
