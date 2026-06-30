import { expect, test, type Browser, type Page } from "@playwright/test"

const mobileViewport = { width: 390, height: 844 }

const memberRoutes = [
  "/member/dashboard",
  "/member/membership",
  "/member/progress",
] as const

test("mobile member shell remains usable after desktop UX rework", async ({
  browser,
}) => {
  const context = await createMobileContext(browser)
  const page = await context.newPage()

  await loginAsMember(page)

  for (const route of memberRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" })
    await waitForMsw(page)
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined)

    await expect(page.getByTestId("mobile-command-nav")).toBeVisible()
    await expect(page.getByTestId("command-rail")).toBeHidden()

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(horizontalOverflow).toBeLessThanOrEqual(4)
  }

  await context.close()
})

async function createMobileContext(browser: Browser) {
  const context = await browser.newContext({
    viewport: mobileViewport,
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
    reducedMotion: "reduce",
  })

  await context.addInitScript(() => {
    window.localStorage.setItem(
      "gymmaster-sidebar-state",
      JSON.stringify({
        state: {
          isCollapsed: false,
          theme: "light",
          colorPreset: "lime",
          isSettingsOpen: false,
        },
        version: 0,
      }),
    )
  })

  return context
}

async function loginAsMember(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" })
  await waitForMsw(page)
  await page.getByTestId("login-email-input").fill("member@gymmaster.local")
  await page.getByTestId("login-password-input").fill("Password123!")
  await page.getByTestId("login-submit-button").click()
  await page.waitForURL(/\/member\/dashboard$/, { timeout: 15_000 })
}

async function waitForMsw(page: Page) {
  await page.waitForFunction(
    () => window.__GYMMASTER_MSW_READY__ === true,
    undefined,
    { timeout: 15_000 },
  )
}
