import { expect, test } from "@playwright/test"

test("welcome page loads in browser mock mode", async ({ page }) => {
  await page.goto("/welcome")

  await expect(page.getByText("GymMaster").first()).toBeVisible()
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible()
  await expect(page.getByText("Premium fitness operations workspace")).toBeVisible()
})
