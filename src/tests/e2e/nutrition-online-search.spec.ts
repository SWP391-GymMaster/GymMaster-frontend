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

test.describe("Nutrition Online Food Search Flow", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`)
    })
  })

  test("Member uses online search via button when local results are empty and logs successfully", async ({ page }) => {
    await loginAsMember(page)

    // Go to meal journal
    await page.goto("/member/nutrition/meal-journal")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

    // Open add meal dialog
    await page.getByRole("button", { name: "Thêm bữa ăn mới" }).click()

    // Type a keyword that is empty locally
    await page.getByTestId("member-food-search-input").fill("mì tôm")

    // Wait for local search loading state to resolve
    await expect(page.getByText("Đang tra cứu...")).not.toBeVisible({ timeout: 5000 })

    // The prominent online search button should be visible
    const triggerBtn = page.getByTestId("online-search-trigger-btn")
    await expect(triggerBtn).toBeVisible()

    // Click it to run online lookup
    await triggerBtn.click()

    // Heading and online search results should render
    await expect(page.getByText("Kết quả trực tuyến từ Open Food Facts")).toBeVisible()
    const resultCard = page.getByTestId("online-food-result").first()
    await expect(resultCard).toBeVisible()
    await expect(resultCard).toContainText("Mì Hảo Hảo chua cay (Acecook)")

    // Click result card
    await resultCard.click()

    // Verify Preview Dialog opens
    await expect(page.getByText("Xem trước dinh dưỡng sản phẩm")).toBeVisible()
    await expect(page.locator("#preview-name")).toHaveValue("Mì Hảo Hảo chua cay (Acecook)")
    await expect(page.locator("#preview-unit")).toHaveValue("75g")
    await expect(page.locator("#preview-calories")).toHaveValue("466")

    // Change unit to 'gói'
    await page.locator("#preview-unit").fill("gói")

    // Confirm product selection
    await page.getByRole("button", { name: "Xác nhận và Chọn" }).click()

    // Dialog should close
    await expect(page.getByText("Xem trước dinh dưỡng sản phẩm")).not.toBeVisible()

    // Check if it is selected on the main add meal form
    await expect(page.locator("#add-meal")).toContainText("Mì Hảo Hảo chua cay (Acecook)")

    // Log the meal with quantity 1
    await page.getByTestId("member-meal-quantity-input").fill("1")
    await page.getByTestId("member-add-meal-button").click()

    // Verify logged successfully
    await expect(page.getByText("Đã thêm bữa ăn")).toBeVisible()
    await expect(page.getByTestId("member-meal-log-list")).toContainText("Mì Hảo Hảo chua cay (Acecook)")
  })

  test("Member uses online search helper link when local results exist and logs successfully", async ({ page }) => {
    await loginAsMember(page)

    // Go to meal journal
    await page.goto("/member/nutrition/meal-journal")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

    // Open add meal dialog
    await page.getByRole("button", { name: "Thêm bữa ăn mới" }).click()

    // Type a keyword that matches local database
    await page.getByTestId("member-food-search-input").fill("sữa")

    // Local results are visible
    await expect(page.getByTestId("member-food-result").first()).toBeVisible()

    // Helper link should be visible at the bottom
    const helperLink = page.getByTestId("online-search-link")
    await expect(helperLink).toBeVisible()

    // Click it to run online lookup
    await helperLink.click()

    // Heading and online search results should render
    await expect(page.getByText("Kết quả trực tuyến từ Open Food Facts")).toBeVisible()
    const resultCard = page.getByTestId("online-food-result").first()
    await expect(resultCard).toBeVisible()
    await expect(resultCard).toContainText("Sữa tươi TH True Milk ít đường (TH True Milk)")

    // Click result card
    await resultCard.click()

    // Confirm product selection directly
    await page.getByRole("button", { name: "Xác nhận và Chọn" }).click()

    // Log the meal with quantity 3
    await page.getByTestId("member-meal-quantity-input").fill("3")
    await page.getByTestId("member-add-meal-button").click()

    // Verify logged successfully
    await expect(page.getByText("Đã thêm bữa ăn")).toBeVisible()
    await expect(page.getByTestId("member-meal-log-list")).toContainText("Sữa tươi TH True Milk ít đường (TH True Milk)")
  })
})
