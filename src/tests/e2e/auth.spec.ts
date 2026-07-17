import { expect, test, type Locator, type Page } from "@playwright/test"

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

async function expectNextKeyboardFocus(page: Page, locator: Locator) {
  await page.keyboard.press("Tab")
  await expect(locator).toBeFocused()

  const hasVisibleIndicator = await locator.evaluate((element) => {
    const style = window.getComputedStyle(element)
    return style.outlineStyle !== "none" || style.boxShadow !== "none"
  })
  expect(hasVisibleIndicator).toBe(true)
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

test("mobile login keeps critical content visible without requesting the raster cover", async ({
  page,
}) => {
  const coverRequests: string[] = []
  page.on("request", (request) => {
    if (request.url().includes("gym-operations-cover")) {
      coverRequests.push(request.url())
    }
  })
  await page.setViewportSize({ width: 412, height: 823 })

  await openLogin(page)

  await expect(
    page.getByRole("heading", { name: "Chào mừng quay lại." }),
  ).toBeVisible()
  await expect(page.getByText(/Đăng nhập bằng tài khoản GymMaster/)).toBeVisible()
  await expect(page.getByTestId("login-email-input")).toBeVisible()
  await expect(page.getByTestId("login-password-input")).toBeVisible()
  await expect(page.getByTestId("login-submit-button")).toBeVisible()
  expect(coverRequests).toEqual([])
})

test("desktop login requests only the optimized cover within budget", async ({
  page,
}) => {
  const coverResponses: Array<{ bodySize: number; url: string }> = []
  page.on("response", async (response) => {
    if (response.url().includes("gym-operations-cover")) {
      coverResponses.push({
        bodySize: (await response.body()).byteLength,
        url: response.url(),
      })
    }
  })
  await page.setViewportSize({ width: 1440, height: 1000 })

  await openLogin(page)
  await page.waitForLoadState("networkidle")

  expect(coverResponses).toHaveLength(1)
  expect(coverResponses[0]?.url).toContain("gym-operations-cover.webp")
  expect(coverResponses[0]?.bodySize).toBeLessThanOrEqual(150 * 1024)
})

test("login exposes a predictable keyboard order with visible focus", async ({
  page,
}) => {
  await openLogin(page)

  await expectNextKeyboardFocus(page, page.getByRole("link", { name: "GymMaster OS" }))
  await expectNextKeyboardFocus(page, page.getByTestId("login-email-input"))
  await expectNextKeyboardFocus(page, page.getByRole("link", { name: "Quên mật khẩu?" }))
  await expectNextKeyboardFocus(page, page.getByTestId("login-password-input"))
  await expectNextKeyboardFocus(page, page.getByTestId("login-submit-button"))
  await expectNextKeyboardFocus(page, page.getByTestId("google-login-button"))
})

test("login remains usable with reduced motion when the decorative cover fails", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.route("**/assets/gymmaster/gym-operations-cover.webp", (route) =>
    route.abort(),
  )
  await page.setViewportSize({ width: 1440, height: 1000 })

  await openLogin(page)

  await expect(
    page.getByRole("heading", { name: "Chào mừng quay lại." }),
  ).toBeVisible()
  await expect(page.getByTestId("login-email-input")).toBeVisible()
  await expect(page.getByTestId("login-submit-button")).toBeEnabled()
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
