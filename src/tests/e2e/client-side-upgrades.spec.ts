import { expect, test, type Page } from "@playwright/test"

async function openLogin(page: Page) {
  await page.goto("/login")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
}

async function submitLogin(page: Page, email: string, password = "Password123!") {
  await page.getByTestId("login-email-input").fill(email)
  await page.getByTestId("login-password-input").fill(password)
  await page.getByTestId("login-submit-button").click()
}

async function loginAsMember(page: Page) {
  await openLogin(page)
  await submitLogin(page, "member@gymmaster.local")
  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })
}

test("Member can interact with Water Tracker Bento Card", async ({ page }) => {
  await loginAsMember(page)

  // Verify Dashboard is visible
  await expect(page.getByRole("heading", { name: "Bảng điều khiển hội viên" })).toBeVisible()

  // Verify Water Tracker bento widget is loaded
  const trackerTitle = page.getByRole("heading", { name: "Theo dõi nước" })
  await expect(trackerTitle).toBeVisible()

  // Add 250ml water
  await page.getByRole("button", { name: "250ml" }).click()
  await expect(page.getByText("250", { exact: true })).toBeVisible()

  // Add 500ml water
  await page.getByRole("button", { name: "500ml" }).click()
  await expect(page.getByText("750", { exact: true })).toBeVisible()
})

test("Member can trigger and cancel rest timer in Workout Workspace", async ({ page }) => {
  await loginAsMember(page)

  // Navigate to workout page
  await page.goto("/member/workout")
  await expect(page.getByRole("heading", { name: "Giáo án luyện tập" })).toBeVisible()

  // Click 60s rest button
  await page.getByRole("button", { name: "Nghỉ 60s" }).first().click()

  // Verify Floating Rest Timer is visible
  const overlay = page.locator("#rest-timer-overlay")
  await expect(overlay).toBeVisible()
  await expect(overlay).toContainText("nghỉ")

  // Cancel timer
  await page.getByRole("button", { name: "Bỏ qua" }).click()
  await expect(overlay).not.toBeVisible()
})

test("Member can calculate TDEE and apply calorie target", async ({ page }) => {
  await loginAsMember(page)

  // Navigate to meal journal
  await page.goto("/member/nutrition/meal-journal")
  await expect(page.getByText("Nhật ký hôm nay")).toBeVisible()

  // Open TDEE calculator modal
  await page.getByRole("button", { name: "Tính TDEE" }).click()

  const modalHeading = page.getByRole("heading", { name: "Tính mục tiêu Calo & TDEE" })
  await expect(modalHeading).toBeVisible()

  // Fill in calculations parameters
  await page.locator("#tdee-age").fill("25")
  await page.locator("#tdee-height").fill("175")
  await page.locator("#tdee-weight").fill("70")
  await page.locator("#tdee-activity").selectOption("1.55") // Moderately active

  // Calculate
  await page.getByRole("button", { name: "Tính chỉ số TDEE" }).click()

  // Verify proposed target is displayed
  await expect(page.getByText("Chỉ số TDEE tính toán:")).toBeVisible()

  // Select "Giảm cân" goal (this adjusts proposals)
  await page.getByRole("button", { name: "Giảm cân" }).click()

  // Apply new target
  await page.getByRole("button", { name: "Áp dụng mục tiêu" }).click()

  // Verify modal is closed and target text is updated
  await expect(modalHeading).not.toBeVisible()
})
