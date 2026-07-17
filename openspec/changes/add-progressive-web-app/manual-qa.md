# PWA Manual QA Checklist

Date: 2026-07-17

## Completed in production Chromium

- [x] Manifest is served as `application/manifest+json` with standalone display, root scope/start URL, and regular/maskable icons.
- [x] All manifest PNG icons return successfully.
- [x] `/sw.js` registers with root scope when production API mocking is disabled.
- [x] Worker response includes no-store cache control, JavaScript content type, self-only CSP, and MIME-sniffing protection.
- [x] Cache Storage contains only the `gymmaster-pwa-static-v1` namespace and approved offline/icon/static assets.
- [x] API probe, Member documents, and RSC requests are absent from PWA Cache Storage.
- [x] Offline event shows the Vietnamese connectivity status.
- [x] Offline document navigation renders the branded fallback and visible retry button.
- [x] Mock-enabled Chromium login starts MSW successfully and does not expose role-picker controls.
- [x] Waiting-worker activation, explicit update confirmation, deferral, and one-time reload are covered by lifecycle tests.
- [x] Chromium install eligibility, dismissal, standalone hiding, and keyboard focus are covered by component tests.

## Completed external/manual device checks

- [x] Owner verified actual install and launch behavior in Chrome and Edge on desktop and Chrome on Android.
- [x] Owner verified Safari Add to Home Screen and installed behavior on iOS.
- [x] Lighthouse 13.4.0 CLI audit completed against the local production-mode `/login` route using mobile emulation. Scores: Performance 67, Accessibility 96, Best Practices 100, SEO 100.

Current Lighthouse versions no longer expose a PWA category. Manifest, worker registration, offline fallback, installability, update lifecycle, MSW isolation, and cache privacy therefore remain covered by the production Playwright suite, component/worker tests, Chromium Application inspection, and the owner's physical-device checks.

The Lighthouse report had no runtime error or run warning. The CLI returned a Windows `EPERM` only while deleting its temporary browser profile after writing valid JSON and HTML reports. Follow-up findings are recorded in `verification.md`; they do not indicate a PWA lifecycle or cache-safety failure.
