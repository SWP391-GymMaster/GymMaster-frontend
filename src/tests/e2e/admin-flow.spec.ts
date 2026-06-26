import { expect, test, type Page } from "@playwright/test"

async function openLogin(page: Page) {
  await page.goto("/login")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
}

async function submitLogin(
  page: Page,
  email: string,
  password = "Password123!",
) {
  await page.getByTestId("login-email-input").fill(email)
  await page.getByTestId("login-password-input").fill(password)
  await page.getByTestId("login-submit-button").click()
}

async function loginAsAdmin(page: Page) {
  await openLogin(page)
  await submitLogin(page, "admin@gymmaster.local")
  await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 15_000 })
}

test.describe("Admin Dashboard Flow", () => {
  test("Admin logs in, sees dashboard KPI metrics and chart", async ({
    page,
  }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    await expect(page.getByText("Bảng điều khiển Admin").first()).toBeVisible()

    await expect(page.getByText("HỘI VIÊN HOẠT ĐỘNG").first()).toBeVisible()
    await expect(page.getByText("THANH TOÁN CHỜ XỬ LÝ").first()).toBeVisible()
    await expect(page.getByText("CHECK-IN HÔM NAY").first()).toBeVisible()
    await expect(page.getByText("DOANH THU THÁNG").first()).toBeVisible()
    await expect(
      page.getByText("Tăng trưởng doanh thu").first(),
    ).toBeVisible()
  })

  test("Admin navigates to audit logs and sees entries", async ({
    page,
  }) => {
    await loginAsAdmin(page)

    await page.goto("/admin/audit-logs")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(page.getByText("Nhật ký audit").first()).toBeVisible()

    // Table rows should render actor names
    await expect(page.getByText("Admin User").first()).toBeVisible()
    await expect(page.getByText("Front Desk Staff").first()).toBeVisible()
  })

  test("Non-admin user sees permission denial on admin route", async ({
    page,
  }) => {
    await openLogin(page)
    await submitLogin(page, "member@gymmaster.local")

    await page.goto("/admin/dashboard")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(
      page.getByText("Bạn không có quyền truy cập khu vực này."),
    ).toBeVisible()
  })

  test("Member cannot render Admin PT assignment controls", async ({ page }) => {
    await openLogin(page)
    await submitLogin(page, "member@gymmaster.local")

    await page.goto("/admin/assignments")
    await expect(
      page.getByText("Bạn không có quyền truy cập khu vực này."),
    ).toBeVisible()
    await expect(page.getByTestId("assignment-confirm-button")).toHaveCount(0)
  })

  test("Admin dashboard quick action links work", async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin\/dashboard/)

    await page.getByText("Hội viên mới").click()
    await expect(page).toHaveURL(/\/admin\/members/)
  })

  test("Admin creates Staff account from management screen", async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto("/admin/staff")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(page.getByText("Quản lý lễ tân").first()).toBeVisible()

    await page.getByRole("button", { name: "Thêm nhân sự" }).click()

    await page.getByTestId("user-create-name").fill("Deadline Staff")
    await page
      .getByTestId("user-create-email")
      .fill(`deadline-staff-${Date.now()}@gymmaster.local`)
    await page.getByTestId("user-create-phone").fill("0900000777")
    await page.getByTestId("user-create-submit").click()

    await expect(page.getByText("Deadline Staff")).toBeVisible()
    await expect(page.getByText(/Mật khẩu tạm thời:/)).toBeVisible()
  })

  test("Admin manages full user lifecycle from template workspace", async ({
    page,
  }) => {
    await loginAsAdmin(page)

    await page.goto("/admin/users")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )

    await expect(page.getByText("Tài khoản hệ thống").first()).toBeVisible()

    await page.getByRole("button", { name: "Thêm người dùng" }).click()

    const unique = Date.now()
    await page.getByTestId("user-create-name").fill("Template Staff E2E")
    await page
      .getByTestId("user-create-email")
      .fill(`template-staff-${unique}@gymmaster.local`)
    await page.getByTestId("user-create-phone").fill("0900000555")
    await page.getByTestId("user-create-submit").click()

    // Wait for creation toast to ensure mutation completed and query invalidation triggered
    await expect(page.getByText(/User created:/)).toBeVisible()

    await page
      .getByTestId("admin-user-directory-item")
      .filter({ hasText: "Template Staff E2E" })
      .click()
    await page.getByTestId("user-edit-name").fill("Template Staff Lead E2E")
    await page.getByTestId("user-edit-submit").click()

    await expect(page.getByText("Đã cập nhật thông tin người dùng")).toBeVisible()
    await expect(page.getByText("Template Staff Lead E2E").first()).toBeVisible()

    await page.getByTestId("user-toggle-lock-button").click()
    await expect(page.getByText("Đã khóa tài khoản")).toBeVisible()
    await expect(page.getByText("Đã khóa").first()).toBeVisible()

    // Select the security (Bảo mật) tab to expose reset password and delete buttons
    await page.getByRole("tab", { name: "Bảo mật" }).click()

    await page.getByTestId("user-reset-password-button").click()
    await expect(page.getByText("Đã tạo mật khẩu tạm thời")).toBeVisible()
    await expect(page.getByText(/Mật khẩu tạm thời:/)).toBeVisible()

    await page.getByTestId("user-delete-button").click()
    await expect(page.getByText("Đã vô hiệu hóa tài khoản")).toBeVisible()
    await expect(page.getByText("Template Staff Lead E2E")).toHaveCount(0)
  })

  test("Admin assigns PT and sees audit reference", async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto("/admin/assignments")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(
      page.getByRole("heading", { name: "Phân công PT" }).first(),
    ).toBeVisible()

    await page.getByRole("button", { name: "Bắt đầu phân công PT" }).click()

    await page.getByText("Tran Bao Long").click()
    await page.getByText("Jessica Vance").click()
    await page.getByTestId("assignment-confirm-button").click()

    await expect(page.getByTestId("assignment-success")).toContainText(
      "Đã phân công PT",
    )
    await expect(page.getByTestId("assignment-success")).toContainText(
      "ASSIGN_PT",
    )
  })

})
