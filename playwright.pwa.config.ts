import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./src/tests/e2e-pwa",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3200",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "npm run build && npm run start -- --port 3200 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3200/welcome",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_API_MOCKING: "disabled",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3200",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
  projects: [
    {
      name: "pwa-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
