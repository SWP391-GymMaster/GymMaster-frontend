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
    await expect(page.getByText("Coach hub PT").first()).toBeVisible()
    await expect(page.getByText("Hội viên được phân công").first()).toBeVisible()
  })

  test("PT navigates to member 360 from dashboard", async ({ page }) => {
    await loginAsPT(page)
    await expect(page).toHaveURL(/\/pt\/dashboard/)

    // Click on a member to go to 360
    await page.getByText("Nguyen Minh Anh").first().click()
    await expect(page).toHaveURL(/\/pt\/members\/101/, { timeout: 15_000 })
    await expect(page.getByText("Hội viên phụ trách").first()).toBeVisible()
  })

  test("PT creates workout plan for assigned member", async ({ page }) => {
    await loginAsPT(page)
    await page.goto("/pt/members/101/workout")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )

    await expect(page.getByText("Trình tạo giáo án").first()).toBeVisible()
    await page.getByLabel("Tên giáo án").fill("Deadline Strength Block")
    await page.getByLabel("Tên bài tập").fill("Deadlift")
    await page.getByLabel("Số hiệp").fill("5")
    await page.getByLabel("Reps").fill("5")
    await page
      .getByLabel("Ghi chú bài tập")
      .fill("Stop one rep before form breaks.")
    await page.getByTestId("workout-plan-submit-button").click()

    await expect(page.getByText("Đã lưu giáo án")).toBeVisible()
    await expect(page.getByText("Deadline Strength Block")).toBeVisible()
    await expect(page.getByText("Deadlift")).toBeVisible()
  })

  test("PT adds trainer note for assigned member", async ({ page }) => {
    await loginAsPT(page)
    await page.goto("/pt/members/101/notes")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )

    await expect(page.getByText("Ghi chú PT").first()).toBeVisible()
    await page
      .getByLabel("Ghi chú huấn luyện")
      .fill("Keep shoulder warm-up before pressing.")
    await page.getByTestId("trainer-note-submit-button").click()

    await expect(page.getByText("Đã lưu ghi chú PT")).toBeVisible()
    await expect(
      page.getByText("Keep shoulder warm-up before pressing.").first(),
    ).toBeVisible()
  })

  test("Member views workout and notes read-only", async ({ page }) => {
    await openLogin(page)
    await submitLogin(page, "member@gymmaster.local")

    await page.goto("/member/workout")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(page.getByText("Chế độ xem hội viên").first()).toBeVisible()
    await expect(page.getByText("Foundation Strength")).toBeVisible()
    await expect(page.getByTestId("workout-plan-submit-button")).toHaveCount(0)

    await page.goto("/member/notes")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(page.getByText("Chế độ xem hội viên").first()).toBeVisible()
    await expect(
      page.getByText("Keep shoulder warm-up before pressing.").first(),
    ).toBeVisible()
    await expect(page.getByTestId("trainer-note-submit-button")).toHaveCount(0)
  })

  test("Non-PT user sees permission denial", async ({ page }) => {
    await openLogin(page)
    await submitLogin(page, "member@gymmaster.local")

    await page.goto("/pt/dashboard")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(
      page.getByText("Bạn không có quyền truy cập khu vực này."),
    ).toBeVisible()
  })
})
