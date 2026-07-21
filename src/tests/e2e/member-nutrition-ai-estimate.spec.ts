import { expect, test, type Page } from "@playwright/test"

async function loginAsMember(page: Page) {
  await page.goto("/login")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
  await page.getByTestId("login-email-input").fill("member@gymmaster.local")
  await page.getByTestId("login-password-input").fill("Password123!")
  await page.getByTestId("login-submit-button").click()
  await expect(page).toHaveURL(/\/member\/dashboard$/, { timeout: 15_000 })
}

test("quantity keeps focus while the member types multiple digits", async ({ page }, testInfo) => {
  await loginAsMember(page)
  await page.goto("/member/nutrition/meal-journal?view=add")

  await page.getByTestId("member-food-search-input").fill("banana")
  await page.getByText("Banana", { exact: true }).click()

  const quantityInput = page.getByTestId("member-meal-quantity-input")
  await quantityInput.fill("")
  await quantityInput.type("350")

  await expect(quantityInput).toBeFocused()
  await expect(quantityInput).toHaveValue("350")
  await testInfo.attach("quantity-focus-fixed", {
    body: await page.screenshot(),
    contentType: "image/png",
  })
})

test("Gemini estimate fills editable nutrition values for a generic food name", async ({ page }, testInfo) => {
  await loginAsMember(page)
  await page.goto("/member/nutrition/meal-journal?view=add")

  await page.getByTestId("member-food-search-input").fill("Gà ta E2E")
  await page.getByTestId("member-custom-food-trigger").click()
  await page.getByTestId("member-custom-food-ai-estimate").click()

  await expect(page.getByTestId("member-custom-food-unit")).toHaveValue("100g")
  await expect(page.getByTestId("member-custom-food-calories")).toHaveValue("165")
  await expect(page.getByTestId("member-custom-food-protein")).toHaveValue("31")
  await expect(page.getByTestId("member-custom-food-carbs")).toHaveValue("0")
  await expect(page.getByTestId("member-custom-food-fat")).toHaveValue("3.6")

  await page.getByTestId("member-custom-food-calories").fill("170")
  await expect(page.getByTestId("member-custom-food-calories")).toHaveValue("170")
  await testInfo.attach("ai-estimate-editable", {
    body: await page.screenshot(),
    contentType: "image/png",
  })
})
