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

async function loginAsPT(page: Page) {
  await openLogin(page)
  await submitLogin(page, "pt@gymmaster.local")
}

test.describe("PT Dashboard Flow", () => {
  test("PT logs in, sees dashboard with assigned members", async ({
    page,
  }) => {
    await loginAsPT(page)

    await expect(page).toHaveURL(/\/pt\/dashboard/)
    await expect(page.getByText("PT Dashboard").first()).toBeVisible()
    await expect(page.getByText("Assigned members").first()).toBeVisible()
  })

  test("PT navigates to member 360 from dashboard", async ({ page }) => {
    await loginAsPT(page)
    await expect(page).toHaveURL(/\/pt\/dashboard/)

    // Click on a member to go to 360
    await page.getByText("Nguyen Minh Anh").first().click()
    await expect(page).toHaveURL(/\/pt\/members\/101/, { timeout: 15_000 })
    await expect(page.getByText("Assigned member").first()).toBeVisible()
  })

  test("Non-PT user sees permission denial", async ({ page }) => {
    await openLogin(page)
    await submitLogin(page, "member@gymmaster.local")

    await page.goto("/pt/dashboard")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(
      page.getByText("You do not have access to this workspace."),
    ).toBeVisible()
  })
})
