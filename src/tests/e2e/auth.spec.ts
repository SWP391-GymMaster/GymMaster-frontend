import { expect, test, type Page } from "@playwright/test"

const roleCases = [
  {
    email: "admin@gymmaster.local",
    dashboardPath: "/admin/dashboard",
    dashboardTitle: "Admin Dashboard",
  },
  {
    email: "staff@gymmaster.local",
    dashboardPath: "/staff/dashboard",
    dashboardTitle: "Staff Dashboard",
  },
  {
    email: "pt@gymmaster.local",
    dashboardPath: "/pt/dashboard",
    dashboardTitle: "PT Dashboard",
  },
  {
    email: "member@gymmaster.local",
    dashboardPath: "/member/dashboard",
    dashboardTitle: "Member Dashboard",
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
    page.getByRole("heading", { name: "Member Dashboard" }),
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
    page.getByRole("main").getByText("Email or password is incorrect."),
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
    page.getByRole("heading", { name: "Member Dashboard" }),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Admin" })).toHaveCount(0)
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
    page.getByText("Password reset successfully. You can sign in now."),
  ).toBeVisible()
})
