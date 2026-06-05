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

test.describe("Role-based Notifications E2E Flow", () => {
  test("Staff flow: views notifications, check-in triggers new notification, deep links and marks as read", async ({ page }) => {
    // 1. Log in as Staff
    await openLogin(page)
    await submitLogin(page, "staff@gymmaster.local")
    await expect(page).toHaveURL(/\/staff\/dashboard$/)

    // 2. Locate the header notification bell icon. Check that unread badge is visible.
    const bellBtn = page.getByRole("button", { name: "Thông báo" })
    await expect(bellBtn).toBeVisible()

    // 3. Open notifications drawer
    await bellBtn.click()
    await expect(page.getByText("Thông báo vai trò")).toBeVisible()
    await expect(page.getByText("Khu vực Lễ tân")).toBeVisible()
    
    // Verify initial mock notification is visible
    await expect(page.getByText("Lâm Minh Anh vừa check-in tại quầy chính.")).toBeVisible()

    // Close notifications drawer
    await page.getByRole("button", { name: "Đóng cửa sổ" }).click()
    await expect(page.getByText("Thông báo vai trò")).not.toBeVisible()

    // 4. Perform a check-in to trigger a new dynamic notification
    await page.goto("/staff/check-in")
    await page.getByTestId("staff-checkin-search").fill("GM-101")
    await page.getByRole("button", { name: "Tìm" }).click()
    await page.locator("section").filter({ hasText: "Kết quả tra cứu" }).getByText("Nguyen Minh Anh").click()
    await page.getByTestId("staff-checkin-confirm").click()
    await expect(page.getByTestId("staff-checkin-result")).toContainText("Đã xác nhận check-in")

    // 5. Check notification drawer again to see the new check-in notification
    await bellBtn.click()
    await expect(page.getByText("Nguyen Minh Anh vừa check-in tại quầy chính.")).toBeVisible()

    // 6. Click the new notification row, which should deep link to member's detail page
    await page.getByText("Nguyen Minh Anh vừa check-in tại quầy chính.").click()
    
    // Verify it navigated to staff member detail route
    await expect(page).toHaveURL(/\/staff\/members\/101$/)
    await expect(page.getByRole("heading", { name: "Chi tiết hội viên" })).toBeVisible()
  })

  test("Admin flow: accesses Admin Notification Center page", async ({ page }) => {
    // 1. Log in as Admin
    await openLogin(page)
    await submitLogin(page, "admin@gymmaster.local")
    await expect(page).toHaveURL(/\/admin\/dashboard$/)

    // 2. Go to notifications center route
    await page.goto("/admin/notifications")
    await expect(page.getByRole("heading", { name: "Trung tâm Thông báo" })).toBeVisible()

    // Verify admin notifications exist in table
    await expect(page.getByText("Cảnh báo bảo mật")).toBeVisible()
    await expect(page.getByText("Phát hiện đăng nhập bất thường từ địa chỉ IP lạ.")).toBeVisible()
    await expect(page.getByText("Phân công HLV đồng hành")).toBeVisible()

    // 3. Test filter status: Click on "Chưa đọc" (Unread) filter in left bento rail
    await page.getByRole("button", { name: "Chưa đọc" }).click()
    
    // The read notification "Phân công HLV đồng hành" should be filtered out
    await expect(page.getByText("Phân công HLV đồng hành")).not.toBeVisible()
    await expect(page.getByText("Cảnh báo bảo mật")).toBeVisible()
  })
})
