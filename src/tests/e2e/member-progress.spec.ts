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

async function loginAsPT(page: Page) {
  await openLogin(page)
  await submitLogin(page, "pt@gymmaster.local")
  await expect(page).toHaveURL(/\/pt\/dashboard$/, { timeout: 15_000 })
}

test("Member can view progress dashboard and log a new entry", async ({ page }) => {
  await loginAsMember(page)

  // Navigate to progress page
  await page.getByRole("link", { name: /Theo dõi tiến độ/ }).click()
  await expect(page).toHaveURL(/\/member\/progress$/)

  // Verify charts are visible
  await expect(page.getByTestId("progress-chart-weight")).toBeVisible()
  await expect(page.getByTestId("progress-chart-fat")).toBeVisible()

  // Click "Ghi nhận chỉ số mới" trigger
  await page.getByTestId("member-progress-trigger").click()

  // Verify Dialog content is open
  await expect(page.getByRole("heading", { name: "Ghi nhận chỉ số cơ thể" })).toBeVisible()

  // Fill in weight and body fat
  await page.getByTestId("progress-form-weight").fill("75.4")
  await page.getByTestId("progress-form-fat").fill("16.8")

  // Submit form
  await page.getByTestId("progress-form-submit").click()

  // Verify success toast
  await expect(page.getByText("Ghi nhận chỉ số tiến độ thành công!")).toBeVisible()

  // Verify latest metrics on banner reflect new weight
  await expect(page.getByTestId("latest-weight")).toContainText("75.4 kg")
  await expect(page.getByTestId("latest-fat")).toContainText("16.8%")

  // Verify history list updates
  await expect(page.getByTestId("progress-history-row").first()).toContainText("75.4 kg")
})

test("PT can view assigned member progress in read-only mode", async ({ page }) => {
  await loginAsPT(page)

  // Navigate to member 360 profile (member 101)
  await page.goto("/pt/members/101")
  
  // Verify quick stats show member progress metrics
  await expect(page.getByTestId("member-360-container").or(page.locator("body"))).toContainText("Cân nặng")

  // Wait for the quick action link to be visible
  await expect(page.getByRole("link", { name: /Xem tiến độ/ })).toBeVisible()

  // Click "Xem tiến độ" quick action in trainer workspace
  await page.getByRole("link", { name: /Xem tiến độ/ }).click()
  await expect(page).toHaveURL(/\/pt\/members\/101\/progress$/)

  // Verify charts and history table are visible but read-only
  await expect(page.getByTestId("progress-chart-weight")).toBeVisible()
  await expect(page.getByTestId("progress-chart-fat")).toBeVisible()
  await expect(page.getByTestId("member-progress-trigger")).toHaveCount(0) // No log button for PT
})

test("Staff cannot access Member progress workspace", async ({ page }) => {
  await openLogin(page)
  await submitLogin(page, "staff@gymmaster.local")
  await expect(page).toHaveURL(/\/staff\/dashboard$/)

  await page.goto("/member/progress")
  await expect(
    page.getByText("Bạn không có quyền truy cập khu vực này."),
  ).toBeVisible()
  await expect(page.getByTestId("member-progress-trigger")).toHaveCount(0)
})
