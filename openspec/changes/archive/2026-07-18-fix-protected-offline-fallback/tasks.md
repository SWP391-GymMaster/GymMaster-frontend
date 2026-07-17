## 1. Reproduce and Classify

- [x] 1.1 Record explicit owner approval to apply this fix independently from Gate C and preserve the current unstaged repository state.
- [x] 1.2 Run the restored production PWA suite twice in a clean browser context and capture worker registration/control, navigation request mode/destination/headers, response URL/status/content type, cache access, and rendered document identity.
- [x] 1.3 Prove whether the protected navigation actually fails at the network boundary and classify the defect as service-worker runtime behavior, Playwright control/offline emulation, or an out-of-scope auth/browser issue.

## 2. Smallest Responsible Fix

- [x] 2.1 Confirm the controlled worker correctly handles a rejected document fetch, so no `public/sw.js` or cache-allowlist change is applicable.
- [x] 2.2 Because runtime behavior is correct but browser offline emulation does not deterministically fail the worker's network fetch, update only the PWA Playwright harness to create and verify a genuine worker-handled network failure.
- [x] 2.3 Confirm evidence stays within the approved test-harness branch, with no `PermissionGuard`, auth/session, or expanded-scope change required.

## 3. Regression Verification

- [x] 3.1 Verify the already-open application shows and clears the Vietnamese connectivity notice while the separate failed document navigation returns the branded offline heading and retry action.
- [x] 3.2 Run service-worker, manifest/offline, lifecycle, install/connectivity, and auth permission tests plus the complete production PWA browser suite.
- [x] 3.3 Inspect all GymMaster cache entries and prove that APIs, authentication, protected documents, login documents, Google resources, RSC/router-prefetch requests, and mutations remain excluded.
- [x] 3.4 Run build, typecheck, and lint, and record every pass, warning, failure, or unrelated baseline issue.

## 4. Review Gate

- [x] 4.1 Run strict OpenSpec validation and `graphify update .`, inspect the complete unstaged diff, and present diagnosis plus verification evidence before staging, committing, pushing, deploying, synchronizing, or archiving.
