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

test.describe("Nutrition Barcode Lookup & Scan Flow", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`)
    })
  })

  test("Member lookups barcode manually and logs product successfully", async ({ page }) => {
    await loginAsMember(page)

    // Go to meal journal
    await page.goto("/member/nutrition/meal-journal")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

    // Open add meal dialog
    await page.getByRole("button", { name: "Thêm bữa ăn mới" }).click()

    // Trigger barcode scanner dialog
    await page.getByTitle("Quét mã vạch sản phẩm").click()
    await expect(page.getByText("Quét mã vạch thực phẩm")).toBeVisible()

    // Switch to manual entry tab
    await page.getByRole("button", { name: "Nhập thủ công" }).click()

    // Fill in the simulated barcode and press Enter
    await page.locator("#barcode-input").fill("8936079015707")
    await page.locator("#barcode-input").press("Enter")

    // Wait for the Nutrition Preview dialog to appear
    await expect(page.getByText("Xem trước dinh dưỡng sản phẩm")).toBeVisible()
    await expect(page.locator("#preview-name")).toHaveValue("Sữa tươi TH True Milk ít đường (TH True Milk)")
    await expect(page.locator("#preview-unit")).toHaveValue("180ml")
    await expect(page.locator("#preview-calories")).toHaveValue("70")

    // Edit protein from 3 to 4
    await page.locator("#preview-protein").fill("4")

    // Confirm and select the product
    await page.getByRole("button", { name: "Xác nhận và Chọn" }).click()

    // Preview should close
    await expect(page.getByText("Xem trước dinh dưỡng sản phẩm")).not.toBeVisible()

    // Check if it is selected on the main add meal form
    await expect(page.locator("#add-meal")).toContainText("Sữa tươi TH True Milk ít đường (TH True Milk)")

    // Log the meal with quantity 2
    await page.getByTestId("member-meal-quantity-input").fill("2")
    await page.getByTestId("member-add-meal-button").click()

    // Verify it is logged successfully
    await expect(page.getByText("Đã thêm bữa ăn")).toBeVisible()
    await expect(page.getByTestId("member-meal-log-list")).toContainText("Sữa tươi TH True Milk ít đường (TH True Milk)")
  })

  test("Member uses quick demo barcode selection and logs successfully", async ({ page }) => {
    await loginAsMember(page)

    // Go to meal journal
    await page.goto("/member/nutrition/meal-journal")
    await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)

    // Open add meal dialog
    await page.getByRole("button", { name: "Thêm bữa ăn mới" }).click()

    // Trigger barcode scanner dialog
    await page.getByTitle("Quét mã vạch sản phẩm").click()
    await expect(page.getByText("Quét mã vạch thực phẩm")).toBeVisible()

    // Click quick demo button for Coca-Cola (stored in fallback data: 8934822903102)
    await page.getByText("Nước ngọt Coca-Cola 320ml").click()

    // Wait for the Preview Dialog to appear
    await expect(page.getByText("Xem trước dinh dưỡng sản phẩm")).toBeVisible()
    await expect(page.locator("#preview-name")).toHaveValue("Nước ngọt Coca-Cola 320ml (Coca-Cola)")

    // Confirm product
    await page.getByRole("button", { name: "Xác nhận và Chọn" }).click()

    // Log the meal
    await page.getByTestId("member-meal-quantity-input").fill("1")
    await page.getByTestId("member-add-meal-button").click()

    // Verify logged successfully
    await expect(page.getByText("Đã thêm bữa ăn")).toBeVisible()
    await expect(page.getByTestId("member-meal-log-list")).toContainText("Nước ngọt Coca-Cola 320ml (Coca-Cola)")
  })
})
