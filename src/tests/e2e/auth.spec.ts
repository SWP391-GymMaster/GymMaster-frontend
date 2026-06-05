import { expect, test, type Page } from "@playwright/test"

const roleCases = [
  {
    email: "admin@gymmaster.local",
    dashboardPath: "/admin/dashboard",
    dashboardTitle: "Bảng điều khiển Admin",
  },
  {
    email: "staff@gymmaster.local",
    dashboardPath: "/staff/dashboard",
    dashboardTitle: "Bảng điều khiển lễ tân",
  },
  {
    email: "pt@gymmaster.local",
    dashboardPath: "/pt/dashboard",
    dashboardTitle: "Coach hub PT",
  },
  {
    email: "member@gymmaster.local",
    dashboardPath: "/member/dashboard",
    dashboardTitle: "Bảng điều khiển hội viên",
  },
] as const

async function openLogin(page: Page) {
  await page.goto("/login")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
}

async function submitLogin(page: Page, email: string, password = "Password123!") {
  await page.getByTestId("login-email-input").fill(email)
  await page.getByTestId("login-password-input").fill(password)
  await page.getByTestId("login-submit-button").click()
}

test("login page uses email and password without role picker controls", async ({
  page,
}) => {
  await openLogin(page)

  await expect(page.getByTestId("login-email-input")).toBeVisible()
  await expect(page.getByTestId("login-password-input")).toBeVisible()
  await expect(page.getByTestId("login-submit-button")).toBeVisible()
  await expect(page.getByRole("button", { name: "Admin" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Staff" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "PT" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Member" })).toHaveCount(0)
})

test("google login redirects through backend role without role picker", async ({
  page,
}) => {
  await openLogin(page)

  await page.getByTestId("google-login-button").click()

  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })
  await expect(
    page.getByRole("heading", { name: "Bảng điều khiển hội viên" }),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Admin" })).toHaveCount(0)
})

for (const roleCase of roleCases) {
  test(`login redirects ${roleCase.email} to ${roleCase.dashboardPath}`, async ({
    page,
  }) => {
    await openLogin(page)
    await submitLogin(page, roleCase.email)

    await expect(page).toHaveURL(new RegExp(`${roleCase.dashboardPath}$`), {
      timeout: 15_000,
    })
    await expect(
      page.getByRole("heading", { name: roleCase.dashboardTitle }),
    ).toBeVisible()
  })
}

test("invalid credentials show a safe error without redirect", async ({ page }) => {
  await openLogin(page)
  await submitLogin(page, "unknown@gymmaster.local", "wrong-password")

  await expect(
    page.getByRole("main").getByText("Email hoặc mật khẩu không đúng."),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})

test("locked and rate-limited accounts show backend auth errors", async ({
  page,
}) => {
  await openLogin(page)
  await submitLogin(page, "locked@gymmaster.local")

  await expect(
    page
      .getByRole("main")
      .getByText("Tài khoản này đã bị khóa. Vui lòng liên hệ nhân viên phòng gym."),
  ).toBeVisible()

  await page.reload()
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
  await submitLogin(page, "too-many@gymmaster.local")

  await expect(
    page
      .getByRole("main")
      .getByText("Bạn thử quá nhiều lần. Vui lòng chờ trước khi thử lại."),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})

test("member signup creates member session without role picker", async ({ page }) => {
  await page.goto("/signup")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

  await page.getByTestId("signup-full-name-input").fill("New Member")
  await page
    .getByTestId("signup-email-input")
    .fill(`new-member-${Date.now()}@gymmaster.local`)
  await page.getByTestId("signup-password-input").fill("Password123!")
  await page.getByTestId("signup-submit-button").click()

  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })
  await expect(
    page.getByRole("heading", { name: "Bảng điều khiển hội viên" }),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Admin" })).toHaveCount(0)
})

test("member signup surfaces duplicate email errors", async ({ page }) => {
  await page.goto("/signup")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

  await page.getByTestId("signup-full-name-input").fill("Existing Member")
  await page.getByTestId("signup-email-input").fill("member@gymmaster.local")
  await page.getByTestId("signup-password-input").fill("Password123!")
  await page.getByTestId("signup-submit-button").click()

  await expect(
    page.getByRole("main").getByText("Email này đã được đăng ký."),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/signup$/)
})

test("forgot and reset password flow handles dev reset token", async ({
  page,
}) => {
  await page.goto("/forgot-password")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

  await page.getByTestId("forgot-email-input").fill("member@gymmaster.local")
  await page.getByTestId("forgot-submit-button").click()

  await expect(page.getByText(/mock-reset-token/)).toBeVisible()

  await page.goto("/reset-password?token=mock-reset-token")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
  await page.getByTestId("reset-password-input").fill("NewPassword123!")
  await page.getByTestId("reset-submit-button").click()

  await expect(
    page.getByText("Đã đặt lại mật khẩu. Bạn có thể đăng nhập ngay."),
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Đến trang đăng nhập" })).toBeVisible()
})

test("reset password shows invalid token errors", async ({ page }) => {
  await page.goto("/reset-password?token=expired-reset-token")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

  await page.getByTestId("reset-password-input").fill("NewPassword123!")
  await page.getByTestId("reset-submit-button").click()

  await expect(
    page
      .getByRole("main")
      .getByText("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."),
  ).toBeVisible()
})

test("authenticated member changes password successfully", async ({ page }) => {
  await openLogin(page)
  await submitLogin(page, "member@gymmaster.local")
  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })

  await page.goto("/change-password")
  await page.getByTestId("change-current-password-input").fill("Password123!")
  await page.getByTestId("change-new-password-input").fill("NewPassword123!")
  await page.getByTestId("change-submit-button").click()

  await expect(page.getByRole("status").getByText("Đã đổi mật khẩu.")).toBeVisible()
})

test("expired protected session shows session-expired state", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "gymmaster.auth.session",
      JSON.stringify({
        accessToken: "access-admin",
        refreshToken: "refresh-admin-stale",
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
        role: "admin",
        user: {
          userId: 1,
          email: "admin@gymmaster.local",
          fullName: "Admin",
          role: "admin",
          status: "active",
        },
      }),
    )
  })

  await page.goto("/admin/dashboard")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

  await expect(page.getByText("Phiên đăng nhập đã hết hạn.")).toBeVisible()
  await expect(page.getByRole("link", { name: "Đăng nhập lại" })).toBeVisible()
})

test("wrong-role protected workspace shows non-technical denial", async ({
  page,
}) => {
  await openLogin(page)
  await submitLogin(page, "member@gymmaster.local")
  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })

  await page.goto("/admin/dashboard")

  await expect(
    page.getByText("Bạn không có quyền truy cập khu vực này."),
  ).toBeVisible()
})
