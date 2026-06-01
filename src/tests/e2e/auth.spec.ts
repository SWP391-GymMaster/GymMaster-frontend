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
