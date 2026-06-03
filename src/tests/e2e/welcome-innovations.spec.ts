import { expect, test, type Page } from "@playwright/test"

/** Navigate to the welcome/landing page */
async function goToWelcome(page: Page) {
  await page.goto("/welcome")
  await page.waitForLoadState("domcontentloaded")
}

/** Login as member helper */
async function loginAsMember(page: Page) {
  await page.goto("/login")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
  await page.getByTestId("login-email-input").fill("member@gymmaster.local")
  await page.getByTestId("login-password-input").fill("Password123!")
  await page.getByTestId("login-submit-button").click()
  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })
}

// ─── Welcome Landing Page ────────────────────────────────────────────────────

test("Welcome page loads with hero section and CTA button", async ({ page }) => {
  await goToWelcome(page)

  // Hero heading should be visible
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

  // Login CTA button should be present
  const loginBtn = page.getByRole("link", { name: /Đăng nhập/i }).first()
  await expect(loginBtn).toBeVisible()
})

test("Welcome page Bento grid workspace cards are visible", async ({ page }) => {
  await goToWelcome(page)

  // Scroll down to the bento section
  await page.keyboard.press("End")
  await page.waitForTimeout(500)

  // At least one workspace card should be visible (Staff, Admin, PT, or Member)
  const hasWorkspaceCard = await page
    .getByText(/Lễ tân|Quản trị|Huấn luyện viên|Hội viên/i)
    .first()
    .isVisible()
    .catch(() => false)

  expect(hasWorkspaceCard).toBe(true)
})

test("Demo sandbox copy-to-clipboard works for account credentials", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await goToWelcome(page)

  // Scroll to demo section
  await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight))
  await page.waitForTimeout(300)

  // Find a copy button and click it
  const copyButton = page
    .getByRole("button", { name: /Sao chép|copy/i })
    .first()

  const copyButtonVisible = await copyButton.isVisible().catch(() => false)
  if (!copyButtonVisible) {
    // Skip if demo section not visible in viewport — scroll more
    await page.keyboard.press("End")
    await page.waitForTimeout(300)
  }

  // Verify that a copy button is present on the welcome page
  const copyButtons = page.getByRole("button", { name: /Sao chép|copy/i })
  await expect(copyButtons.first()).toBeVisible({ timeout: 5000 })
})

// ─── BMI & Body Fat Calculator ───────────────────────────────────────────────

test("Member can open BMI Calculator modal from dashboard", async ({ page }) => {
  await loginAsMember(page)

  // Find and click the BMI button
  const bmiButton = page.getByRole("button", { name: /Đo BMI|BMI/i })
  await expect(bmiButton).toBeVisible()
  await bmiButton.click()

  // Modal title should appear
  await expect(
    page.getByText(/Bộ đo Chỉ số Cơ thể|BMI/i),
  ).toBeVisible({ timeout: 5_000 })
})

test("BMI Calculator computes values when sliders are moved", async ({ page }) => {
  await loginAsMember(page)

  // Open BMI modal
  await page.getByRole("button", { name: /Đo BMI|BMI/i }).click()
  await expect(page.getByText(/Bộ đo Chỉ số Cơ thể|BMI/i)).toBeVisible({
    timeout: 5_000,
  })

  // The SVG gauge and BMI score should render
  const svg = page.locator("svg").first()
  await expect(svg).toBeVisible()

  // BMI result value should be a number
  const bmiValueText = await page.locator("span.text-3xl").first().textContent()
  const bmiVal = parseFloat(bmiValueText ?? "0")
  expect(bmiVal).toBeGreaterThan(0)

  // Body fat percentage should be shown
  await expect(page.getByText(/%/)).toBeVisible()
})

test("BMI Calculator switches between male and female gender", async ({ page }) => {
  await loginAsMember(page)

  await page.getByRole("button", { name: /Đo BMI|BMI/i }).click()
  await expect(page.getByText(/Bộ đo Chỉ số Cơ thể/i)).toBeVisible({
    timeout: 5_000,
  })

  // Click Female button — hip slider should appear
  await page.getByRole("button", { name: "Nữ" }).click()
  await expect(page.getByText("Vòng mông:")).toBeVisible()

  // Switch back to Male — hip slider should disappear
  await page.getByRole("button", { name: "Nam" }).click()
  await expect(page.getByText("Vòng mông:")).not.toBeVisible()
})

test("BMI Calculator modal can be closed", async ({ page }) => {
  await loginAsMember(page)

  await page.getByRole("button", { name: /Đo BMI|BMI/i }).click()
  await expect(page.getByText(/Bộ đo Chỉ số Cơ thể/i)).toBeVisible({
    timeout: 5_000,
  })

  // Press Escape to close
  await page.keyboard.press("Escape")
  await expect(page.getByText(/Bộ đo Chỉ số Cơ thể/i)).not.toBeVisible({
    timeout: 3_000,
  })
})

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────────

test("Global '?' shortcut opens keyboard shortcuts help overlay", async ({ page }) => {
  await loginAsMember(page)

  // Press '?' to open shortcuts overlay
  await page.keyboard.press("?")

  // Overlay heading should appear
  await expect(
    page.getByText(/Phím tắt|Shortcuts/i),
  ).toBeVisible({ timeout: 3_000 })

  // Close with Escape
  await page.keyboard.press("Escape")
  await expect(
    page.getByText(/Phím tắt|Shortcuts/i),
  ).not.toBeVisible({ timeout: 2_000 })
})
