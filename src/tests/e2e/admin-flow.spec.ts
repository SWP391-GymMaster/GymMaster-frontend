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
}

test.describe("Admin Dashboard Flow", () => {
  test("Admin logs in, sees dashboard KPI metrics and chart", async ({
    page,
  }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    await expect(page.getByText("Admin Dashboard").first()).toBeVisible()

    await expect(page.getByText("Active memberships")).toBeVisible()
    await expect(page.getByText("Expired memberships")).toBeVisible()
    await expect(page.getByText("Today check-ins")).toBeVisible()
    await expect(page.getByText("Revenue").first()).toBeVisible()
    await expect(
      page.getByText("Revenue & check-in activity").first(),
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
    await expect(page.getByText("Audit Logs").first()).toBeVisible()

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
      page.getByText("You do not have access to this workspace."),
    ).toBeVisible()
  })

  test("Admin dashboard quick action links work", async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin\/dashboard/)

    await page.getByText("Browse members").click()
    await expect(page).toHaveURL(/\/admin\/members/)
  })
})
