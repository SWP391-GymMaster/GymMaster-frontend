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

async function loginAsAdmin(page: Page) {
  await openLogin(page)
  await submitLogin(page, "admin@gymmaster.local")
  await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 15_000 })
}

async function loginAsMember(page: Page) {
  await openLogin(page)
  await submitLogin(page, "member@gymmaster.local")
  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })
}

test.describe("Billing and Member 360 Refinement E2E Flows", () => {
  test("Admin package management flow (list, search, create, edit)", async ({ page }) => {
    await loginAsAdmin(page)

    // Navigate to packages configuration
    await page.goto("/admin/packages")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
    await expect(page.getByText("Cấu hình gói tập").first()).toBeVisible()

    // Create a new package
    await page.getByTestId("package-add-button").click()
    await expect(page.getByRole("heading", { name: "Thêm gói tập mới" })).toBeVisible()
    
    const uniqueName = `Yoga Pack ${Date.now()}`
    await page.getByTestId("package-form-name").fill(uniqueName)
    await page.getByTestId("package-form-duration").fill("45")
    await page.getByTestId("package-form-price").fill("1500000")
    await page.getByTestId("package-form-status").selectOption("active")
    await page.getByTestId("package-form-submit").click()

    // Verify it is added
    await expect(page.getByText(uniqueName).first()).toBeVisible()

    // Search filter
    await page.getByTestId("package-search-input").fill(uniqueName)
    await expect(page.getByText("Premium 30")).toHaveCount(0) // Other packages hidden

    // Clear search
    await page.getByTestId("package-search-input").fill("")

    // Edit package
    const firstEditBtn = page.getByTestId("package-edit-1")
    await firstEditBtn.click()
    await expect(page.getByRole("heading", { name: "Chỉnh sửa gói tập" })).toBeVisible()
    
    await page.getByTestId("package-form-name").fill("Premium 30 Edited")
    await page.getByTestId("package-form-submit").click()
    
    // Verify update
    await expect(page.getByText("Premium 30 Edited").first()).toBeVisible()
  })

  test("Admin memberships & payments view flows", async ({ page }) => {
    await loginAsAdmin(page)

    // Navigate to memberships
    await page.goto("/admin/memberships")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
    await expect(page.getByText("Danh sách hợp đồng").first()).toBeVisible()
    await expect(page.getByTestId("memberships-table")).toBeVisible()
    await expect(page.getByText("Nguyen Minh Anh").first()).toBeVisible()

    // Navigate to payments
    await page.goto("/admin/payments")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
    await expect(page.getByText("Nhật ký thanh toán").first()).toBeVisible()
    await expect(page.getByTestId("payments-table")).toBeVisible()
    await expect(page.getByText("GD-8001").first()).toBeVisible()
  })

  test("Member self membership details view flow", async ({ page }) => {
    await loginAsMember(page)

    // Navigate to billing details
    await page.goto("/member/membership")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
    await expect(page.getByText("Gói tập & Hóa đơn").first()).toBeVisible()
    
    // Verify bento cards
    await expect(page.getByText("Gói tập hiện tại")).toBeVisible()
    await expect(page.getByText("Huấn luyện viên cá nhân (PT)")).toBeVisible()
    await expect(page.getByText("Check-in gần đây")).toBeVisible()

    // Verify invoices table
    await expect(page.getByTestId("member-payments-table")).toBeVisible()
    await expect(page.getByText("GD-8001").first()).toBeVisible()
  })

  test("Dynamic Member 360 view flow for Admin", async ({ page }) => {
    await loginAsAdmin(page)

    // Go to Nguyen Minh Anh (ID 101) Member 360 page
    await page.goto("/admin/members/101")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
    
    // Verify stats checks
    await expect(page.getByText("Tổng check-in").first()).toBeVisible()
    // It should count check-ins dynamically
    await expect(page.getByText("1 lần").first()).toBeVisible() // Default mock data check-ins count is 1

    // Verify timeline activities are visible and show correct dynamic content
    await expect(page.getByText("Ghi chú & hoạt động gần đây").first()).toBeVisible()
    await expect(page.getByTestId("timeline-event-checkin").first()).toBeVisible()
    await expect(page.getByTestId("timeline-event-note").first()).toBeVisible()
    await expect(page.getByTestId("timeline-event-assignment").first()).toBeVisible()
  })
})
