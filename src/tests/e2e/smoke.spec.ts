import { expect, test } from "@playwright/test"

test("welcome page loads in browser mock mode", async ({ page }) => {
  await page.goto("/welcome")

  await expect(page.getByText("GymMaster OS").first()).toBeVisible()
  await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible()
  await expect(page.getByText("System Initialized")).toBeVisible()
})
