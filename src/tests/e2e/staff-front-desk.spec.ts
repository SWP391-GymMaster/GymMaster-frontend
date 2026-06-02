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

async function loginAsStaff(page: Page) {
  await openLogin(page)
  await submitLogin(page, "staff@gymmaster.local")
  await expect(page).toHaveURL(/\/staff\/dashboard$/)
}

test("Staff dashboard shows route-aware shell metrics", async ({ page }) => {
  await loginAsStaff(page)

  await expect(page.getByText("Today operations")).toBeVisible()
  await expect(page.getByText("Front desk ready")).toBeVisible()
  await expect(page.getByText("Skeleton only")).toHaveCount(0)
})

test("Staff searches and opens member detail", async ({ page }) => {
  await loginAsStaff(page)

  await page.goto("/staff/members")
  await page.getByTestId("staff-member-search-input").fill("0900000101")
  await expect(page.getByText("Nguyen Minh Anh")).toBeVisible()

  await page
    .getByTestId("staff-member-result")
    .first()
    .getByRole("link", { name: "Open" })
    .click()
  await expect(page).toHaveURL(/\/staff\/members\/101$/, { timeout: 15_000 })
  await expect(page.getByRole("heading", { name: "Member Detail" })).toBeVisible()
  await expect(page.getByText("Premium 30")).toBeVisible()
})

test("Staff creates package sale and records payment", async ({ page }) => {
  await loginAsStaff(page)

  await page.goto("/staff/sell-package")
  await page.getByTestId("staff-sell-member-search").fill("member@gymmaster.local")
  await page.getByRole("button", { name: "Find" }).click()
  await page.getByText("Nguyen Minh Anh").click()
  await page.getByText("Strength 90").click()
  await page.getByTestId("staff-sell-submit-button").click()

  await expect(page.getByTestId("staff-sell-result")).toContainText(
    "Membership is pending",
  )
  await page.getByTestId("staff-record-payment-button").click()
  await expect(page.getByTestId("staff-sell-result")).toContainText(
    "Manual payment recorded",
  )
})

test("Staff renews membership and records payment", async ({ page }) => {
  await loginAsStaff(page)

  await page.goto("/staff/renew-package")
  await page.getByTestId("staff-renew-member-search").fill("member@gymmaster.local")
  await page.getByRole("button", { name: "Find" }).click()
  await page.getByText("Nguyen Minh Anh").click()
  await expect(page.getByText(/Premium 30 · ends/i)).toBeVisible()
  await page.getByText("Strength 90").click()
  await expect(page.getByTestId("staff-renew-summary")).toContainText(
    "2026-07-01 to 2026-09-29",
  )
  await page.getByTestId("staff-renew-submit-button").click()

  await expect(page.getByTestId("staff-renew-result")).toContainText(
    "Renewal is pending",
  )
  await page.getByTestId("staff-record-payment-button").click()
  await expect(page.getByTestId("staff-renew-result")).toContainText(
    "Manual payment recorded",
  )
})

test("Staff confirms active member check-in", async ({ page }) => {
  await loginAsStaff(page)

  await page.goto("/staff/check-in")
  await page.getByTestId("staff-checkin-search").fill("GM-101")
  await page.getByRole("button", { name: "Find" }).click()
  await page.getByText("Nguyen Minh Anh").click()
  await page.getByTestId("staff-checkin-confirm").click()

  await expect(page.getByTestId("staff-checkin-result")).toContainText(
    "Check-in confirmed",
  )
})

test("Staff sees safe check-in denial for inactive member", async ({ page }) => {
  await loginAsStaff(page)

  await page.goto("/staff/check-in")
  await page.getByTestId("staff-checkin-search").fill("GM-103")
  await page.getByRole("button", { name: "Find" }).click()
  await page.getByText("Le Hoang My").click()
  await page.getByTestId("staff-checkin-confirm").click()

  await expect(page.getByTestId("staff-checkin-result")).toContainText(
    "Check-in denied",
  )
})

test("Member cannot render Staff operational routes", async ({ page }) => {
  await openLogin(page)
  await submitLogin(page, "member@gymmaster.local")
  await expect(page).toHaveURL(/\/member\/dashboard$/)

  await page.goto("/staff/members")
  await expect(page.getByText("You do not have access to this workspace.")).toBeVisible()
  await expect(page.getByTestId("staff-member-search-input")).toHaveCount(0)
})
