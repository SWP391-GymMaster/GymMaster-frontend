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

async function loginAsMember(page: Page) {
  await openLogin(page)
  await submitLogin(page, "member@gymmaster.local")
  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })
}

test("Member adds a meal and sees calorie summary update", async ({ page }) => {
  await loginAsMember(page)

  await expect(page.getByRole("heading", { name: "Bảng điều khiển hội viên" })).toBeVisible()
  await page.getByRole("link", { name: /Ghi bữa ăn/ }).click()
  await expect(page).toHaveURL(/\/member\/nutrition\/meal-journal$/)

  await page.getByRole("button", { name: "Thêm bữa ăn mới" }).click()

  await page.getByTestId("member-food-search-input").fill("banana")
  await page.getByText("Banana", { exact: true }).click()
  await page.getByTestId("member-meal-quantity-input").fill("2")
  await page.getByTestId("member-add-meal-button").click()

  await page.getByTestId("member-confirm-cart-button").click()
  await expect(page.getByText(/Đã ghi \d+ món vào nhật ký/)).toBeVisible()
  await expect(page.getByTestId("member-meal-log-list")).toContainText("Banana")

  await page.goto("/member/nutrition/summary")
  await expect(page.getByTestId("member-calorie-summary")).toContainText("Đã ăn")
  await expect(page.getByTestId("member-calorie-summary")).toContainText("kcal")
})

test("Member sees AI food scan without barcode scanner", async ({ page }) => {
  await loginAsMember(page)

  await page.goto("/member/nutrition/meal-journal")
  await page.getByRole("button", { name: "Thêm bữa ăn mới" }).click()

  await expect(
    page.getByRole("button", { name: "Quét ảnh món ăn bằng AI" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Quét mã vạch thực phẩm" }),
  ).toHaveCount(0)
})

test("Staff cannot access Member nutrition routes", async ({ page }) => {
  await openLogin(page)
  await submitLogin(page, "staff@gymmaster.local")
  await expect(page).toHaveURL(/\/staff\/dashboard$/)

  await page.goto("/member/nutrition/meal-journal")
  await expect(
    page.getByText("Bạn không có quyền truy cập khu vực này."),
  ).toBeVisible()
  await expect(page.getByTestId("member-food-search-input")).toHaveCount(0)
})

test("Member creates custom food and logs it successfully", async ({ page }) => {
  await loginAsMember(page)

  await page.goto("/member/nutrition/meal-journal")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

  await page.getByRole("button", { name: "Thêm bữa ăn mới" }).click()

  // Search for non-existent food
  await page.getByTestId("member-food-search-input").fill("Táo Nhật Bản E2E")

  // Verify empty state triggers the custom food dialog button
  await expect(page.getByText("Không tìm thấy món phù hợp", { exact: true })).toBeVisible()
  await page.getByTestId("member-custom-food-trigger").click()

  // Verify Dialog content is open
  await expect(page.getByRole("heading", { name: "Tạo món ăn mới" })).toBeVisible()

  // Verify name input is prepopulated
  await expect(page.getByTestId("member-custom-food-name")).toHaveValue("Táo Nhật Bản E2E")

  // Fill unit and calories
  await page.getByTestId("member-custom-food-unit").fill("quả")
  await page.getByTestId("member-custom-food-calories").fill("85")

  // Submit custom food
  await page.getByTestId("member-custom-food-submit").click()

  // Success toast verification
  await expect(page.getByText("Đã tạo món ăn: Táo Nhật Bản E2E")).toBeVisible()

  // Verify the custom food is automatically selected
  await expect(page.getByText("Táo Nhật Bản E2E").first()).toBeVisible()

  // Log 3 units of custom food
  await page.getByTestId("member-meal-quantity-input").fill("3")
  await page.getByTestId("member-add-meal-button").click()

  // Verify it appears in the log list
  await page.getByTestId("member-confirm-cart-button").click()
  await expect(page.getByText(/Đã ghi \d+ món vào nhật ký/)).toBeVisible()
  await expect(page.getByTestId("member-meal-log-list")).toContainText("Táo Nhật Bản E2E")
})
