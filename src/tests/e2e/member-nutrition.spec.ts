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

  await page.getByTestId("member-food-search-input").fill("banana")
  await page.getByText("Banana").click()
  await page.getByTestId("member-meal-quantity-input").fill("2")
  await page.getByTestId("member-add-meal-button").click()

  await expect(page.getByText("Đã thêm bữa ăn")).toBeVisible()
  await expect(page.getByTestId("member-meal-log-list")).toContainText("Banana")

  await page.goto("/member/nutrition/summary")
  await expect(page.getByTestId("member-calorie-summary")).toContainText("Đã ăn")
  await expect(page.getByTestId("member-calorie-summary")).toContainText("kcal")
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
