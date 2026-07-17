## Context

`public/sw.js` already treats same-origin document navigations as network-first with a pre-cached `/offline.html` fallback, and its unit harness proves that a rejected network fetch returns that document. The production-mode browser suite also proves worker control and cache privacy, but after `context.setOffline(true)` its navigation to `/member/dashboard` renders the online unauthenticated `PermissionGuard` response instead of the offline document. Repeating the test produces the same result.

This discrepancy does not yet prove a service-worker implementation bug. The browser may be serving a successful navigation response despite the emulated condition, the controlled client/navigation sequence may differ from the unit harness, or the worker may not be observing the expected failing document request. Treating any `200` auth response as offline would be incorrect and could hide legitimate authentication behavior.

## Goals / Non-Goals

**Goals:**

- Observe the actual browser navigation, worker control, fetch path, response, and cache state before selecting a fix.
- Make a genuinely failed controlled document navigation return the branded Vietnamese offline document deterministically.
- Preserve the connectivity notice for an already-open app and all current PWA privacy boundaries.
- Restore a reliable three-test production PWA suite.

**Non-Goals:**

- Caching protected documents, APIs, RSC payloads, authentication responses, or mutations.
- Replacing valid online auth/permission responses with offline UI based only on `navigator.onLine`.
- Changing `PermissionGuard`, session persistence, role routing, or backend behavior.
- Bundling this fix with Gate C or weakening the failing assertion to accept either outcome.

## Decisions

### 1. Diagnose at the browser boundary first

The first apply task captures the controlled page URL, controller script, registration state, request mode/destination/headers, service-worker fetch observation, navigation response URL/status/content type, and whether `/offline.html` was read from the GymMaster cache. The test must also prove that the network boundary genuinely failed rather than merely dispatching a synthetic `offline` event.

### 2. Fix only the responsible layer

- If the worker receives a failing document fetch but does not return the cached fallback, update `public/sw.js` and its unit tests.
- If the worker behavior is correct but Playwright's sequence or offline emulation does not produce a failed controlled navigation, update the PWA browser harness to establish control and deterministically fail the document network path while leaving the runtime worker unchanged.
- If evidence exposes a separate auth or browser defect, stop and request expanded scope rather than changing `PermissionGuard` implicitly.

The implementation must not treat an HTTP success, including an unauthenticated page, as a network failure.

### 3. Keep privacy assertions coupled to fallback verification

The repaired browser test continues to assert that the only GymMaster cache is the versioned static cache, the offline document/icons are present, and no API, protected document, login document, Google resource, or RSC request is cached. The fallback page must remain static and contain no data fetch.

### 4. Verify both offline experiences

One case verifies the live connectivity status on an already-open controlled page. A separate full document navigation under a proven network failure verifies the offline heading and retry action. This distinction prevents client UI state from being mistaken for the service-worker fallback.

## Risks / Trade-offs

- **[Playwright offline emulation differs from installed browsers]** → Capture response/fetch evidence and keep a concise Chrome/Edge manual check in acceptance.
- **[Test-only interception bypasses the service worker]** → Require proof that the controlled worker handles the document request and that `/offline.html` is the returned response.
- **[Runtime fix broadens caching]** → Preserve the exact static allowlist and rerun cache-privacy assertions.
- **[Stale worker/cache affects reproduction]** → Use a clean browser context, wait for activation/control, and inspect the exact worker script URL before going offline.

## Migration Plan

1. Reproduce the failure twice on a clean production build and capture browser/worker evidence.
2. Select either the runtime-worker branch or the test-harness branch from that evidence.
3. Apply the smallest fix and extend the corresponding unit/browser assertions.
4. Run focused PWA/auth tests, the full production PWA suite, build/typecheck/lint, and cache inspection.
5. Present the unstaged diff and evidence for owner review before commit, push, or deployment.

## Open Questions

- Whether Playwright's current `context.setOffline(true)` reaches service-worker-initiated fetches in this exact Chromium/runtime combination will be answered by the diagnostic task, not assumed.

## Implementation Evidence

The restored production PWA suite passed twice (3/3 each) before tracked edits, so the earlier browser failure was not a deterministic runtime-worker defect. A standalone controlled-client diagnostic confirmed one correct fallback response: controller `/sw.js`, `navigator.onLine === false`, a `200 text/html` navigation response with `fromServiceWorker() === true`, the offline heading in the response body, and only the approved static cache entries.

Strengthening the tracked browser assertion then reproduced the flake: `navigator.onLine` was false and the response was reported as service-worker-owned, but its body was the successful online `/member/dashboard` document. Five Chromium CDP offline-emulation diagnostics likewise left the worker's own upstream fetch successful. Therefore browser offline emulation did not deterministically fail the service-worker-initiated network request; `public/sw.js` remained correct and unchanged.

The approved test-harness branch now runs the production Next server behind a local Node proxy. Only when the PWA test adds `x-gymmaster-pwa-test-network-error: 1` to `/member/dashboard` does that proxy close the network socket, giving the controlled production worker a genuine failed document fetch. The browser assertion proves the resulting response is `200 text/html`, comes from the service worker, contains the offline heading, excludes the auth-guard marker, and renders the branded heading/retry action. One focused run and five repeated clean contexts passed after this change.

Final focused verification passed 35/35 PWA and permission-guard unit tests, typecheck, lint with zero errors and 33 pre-existing warnings, and the complete production PWA browser suite (3/3). The browser cache inspection remained limited to `gymmaster-pwa-static-v1` and approved public/immutable assets; APIs, auth traffic, login/protected documents, Google resources, and RSC requests remained absent. The production build passed as part of the PWA web-server command. Next.js continued to print its existing standalone-output warning for `next start`; it did not affect the test result.
