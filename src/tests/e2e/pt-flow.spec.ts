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
  await expect(page).toHaveURL(/\/pt\/dashboard$/, { timeout: 15_000 })
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

    await page.getByRole("button", { name: "Tạo giáo án" }).first().click()

    await expect(page.getByText("Tạo giáo án").first()).toBeVisible()

    // Open the exercise step to fill the inputs.
    await page.getByRole("button").filter({ hasText: "Bài tập" }).click()

    await page.getByLabel("Tên buổi tập").fill("Deadline Strength Block")
    await page.getByPlaceholder("Tên bài tập custom").fill("Deadlift")
    await page.getByLabel("Sets").fill("5")
    await page.getByLabel("Reps").fill("5")
    await page.getByLabel("Cue / ghi chú").fill("Stop one rep before form breaks.")

    // Open the review step to see the submit button.
    await page.getByRole("button").filter({ hasText: "Lưu" }).click()
    await page.getByTestId("workout-plan-submit-button").click()

    await expect(page.getByText("Đã lưu giáo án")).toBeVisible()
    await expect(page.getByText("Deadline Strength Block")).toBeVisible()
    await expect(page.getByAltText("Minh họa bài tập Deadlift")).toBeVisible()
  })

  test("PT applies PPL preset and sees preset exercises", async ({ page }) => {
    await loginAsPT(page)
    await page.goto("/pt/members/101/workout")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )

    await page.getByRole("button", { name: "Tạo giáo án" }).first().click()
    await page.getByRole("button", { name: "Strength" }).click()
    await page.getByRole("button").filter({ hasText: "Preset" }).click()
    await page.getByRole("button").filter({ hasText: "PPL" }).first().click()
    await page.getByRole("button", { name: "Áp dụng buổi mẫu đầu tiên" }).click()

    await expect(page.getByText("Bài tập & tùy chỉnh").first()).toBeVisible()
    await expect(page.getByLabel("Tên buổi tập")).toHaveValue(
      "PPL Push Day Strength · lịch 3 buổi/tuần",
    )

    for (const name of [
      "Bench Press",
      "Overhead Press",
      "Incline Dumbbell Press",
      "Dumbbell Lateral Raise",
      "Cable Triceps Pushdown",
    ]) {
      await expect(page.getByRole("heading", { name })).toBeVisible()
    }

    await expect(
      page.getByAltText("Minh họa bài tập Bench Press").first(),
    ).toBeVisible()

    await page.getByLabel("Chọn bài tập").first().click()
    await expect(
      page.getByRole("option", { name: /^Deadlift/ }),
    ).toBeVisible()
    await expect(
      page.getByRole("option", { name: /^World's Greatest Stretch/ }),
    ).toBeVisible()
  })

  test("PT adds trainer note for assigned member", async ({ page }) => {
    await loginAsPT(page)
    await page.goto("/pt/members/101/notes")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )

    await expect(page.getByText("Ghi chú PT").first()).toBeVisible()

    await page.getByRole("button", { name: "Thêm ghi chú mới" }).click()

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
    await expect(page.getByText("Giáo án của tôi").first()).toBeVisible()
    await expect(page.getByText("Foundation Strength")).toBeVisible()
    await expect(page.getByTestId("workout-plan-submit-button")).toHaveCount(0)

    await page.goto("/member/notes")
    await page.waitForFunction(
      () => window.__GYMMASTER_MSW_READY__ === true,
    )
    await expect(page.getByText("Ghi chú PT").first()).toBeVisible()
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
