import { test, type Page } from "@playwright/test"
import fs from "fs"
import path from "path"

const screenshotDir = path.join(process.cwd(), "docs/design/screenshots")

test.beforeAll(() => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true })
  }
})

async function openPage(page: Page, url: string) {
  await page.goto(url)
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
  await page.waitForTimeout(1000) // Allow animations/layout/charts to settle
}

async function loginAs(page: Page, email: string, redirectUrlPattern: RegExp) {
  await page.goto("/login")
  await page.waitForFunction(() => window.__GYMMASTER_MSW_READY__ === true)
  await page.getByTestId("login-email-input").fill(email)
  await page.getByTestId("login-password-input").fill("Password123!")
  await page.getByTestId("login-submit-button").click()
  await page.waitForURL(redirectUrlPattern, { timeout: 15_000 })
}

test.describe("Public / Auth Screenshots", () => {
  test("welcome page", async ({ page }) => {
    await openPage(page, "/welcome")
    await page.screenshot({ path: path.join(screenshotDir, "welcome.png"), fullPage: true })
  })

  test("login page", async ({ page }) => {
    await openPage(page, "/login")
    await page.screenshot({ path: path.join(screenshotDir, "login.png"), fullPage: true })
  })

  test("signup page", async ({ page }) => {
    await openPage(page, "/signup")
    await page.screenshot({ path: path.join(screenshotDir, "signup.png"), fullPage: true })
  })

  test("landing page", async ({ page }) => {
    await openPage(page, "/")
    await page.screenshot({ path: path.join(screenshotDir, "landing.png"), fullPage: true })
  })

  test("about page", async ({ page }) => {
    await openPage(page, "/about")
    await page.screenshot({ path: path.join(screenshotDir, "about.png"), fullPage: true })
  })

  test("forgot-password page", async ({ page }) => {
    await openPage(page, "/forgot-password")
    await page.screenshot({ path: path.join(screenshotDir, "forgot-password.png"), fullPage: true })
  })

  test("reset-password page", async ({ page }) => {
    await openPage(page, "/reset-password?token=mock-reset-token")
    await page.screenshot({ path: path.join(screenshotDir, "reset-password.png"), fullPage: true })
  })

  test("change-password page", async ({ page }) => {
    await loginAs(page, "member@gymmaster.local", /\/member\/dashboard$/)
    await openPage(page, "/change-password")
    await page.screenshot({ path: path.join(screenshotDir, "change-password.png"), fullPage: true })
  })
})

test.describe("Admin Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin@gymmaster.local", /\/admin\/dashboard$/)
  })

  const adminPages = [
    { url: "/admin/dashboard", filename: "admin-dashboard.png" },
    { url: "/admin/users", filename: "admin-users.png" },
    { url: "/admin/staff", filename: "admin-staff.png" },
    { url: "/admin/trainers", filename: "admin-trainers.png" },
    { url: "/admin/members", filename: "admin-members.png" },
    // Route dong [id] — 101 la member dau tien trong mock data.
    { url: "/admin/members/101", filename: "admin-member-360.png" },
    { url: "/admin/assignments", filename: "admin-assignments.png" },
    { url: "/admin/audit-logs", filename: "admin-audit-logs.png" },
    { url: "/admin/packages", filename: "admin-packages.png" },
    { url: "/admin/memberships", filename: "admin-memberships.png" },
    { url: "/admin/payments", filename: "admin-payments.png" },
    { url: "/admin/profile", filename: "admin-profile.png" },
  ]

  for (const item of adminPages) {
    test(`Capture ${item.url}`, async ({ page }) => {
      await openPage(page, item.url)
      await page.screenshot({ path: path.join(screenshotDir, item.filename), fullPage: true })
    })
  }
})

test.describe("Staff Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "staff@gymmaster.local", /\/staff\/dashboard$/)
  })

  const staffPages = [
    { url: "/staff/dashboard", filename: "staff-dashboard.png" },
    { url: "/staff/members", filename: "staff-members.png" },
    // Route dong [id] — 101 la member dau tien trong mock data.
    { url: "/staff/members/101", filename: "staff-member-360.png" },
    { url: "/staff/check-in", filename: "staff-check-in.png" },
    { url: "/staff/sell-package", filename: "staff-sell-package.png" },
    { url: "/staff/renew-package", filename: "staff-renew-package.png" },
    { url: "/staff/payments", filename: "staff-payments.png" },
    { url: "/staff/profile", filename: "staff-profile.png" },
  ]

  for (const item of staffPages) {
    test(`Capture ${item.url}`, async ({ page }) => {
      await openPage(page, item.url)
      await page.screenshot({ path: path.join(screenshotDir, item.filename), fullPage: true })
    })
  }
})

test.describe("PT Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "pt@gymmaster.local", /\/pt\/dashboard$/)
  })

  const ptPages = [
    { url: "/pt/dashboard", filename: "pt-dashboard.png" },
    { url: "/pt/members/101", filename: "pt-member-360.png" },
    { url: "/pt/members/101/workout", filename: "pt-workout-planner.png" },
    { url: "/pt/members/101/notes", filename: "pt-trainer-notes.png" },
    { url: "/pt/members/101/progress", filename: "pt-member-progress.png" },
    { url: "/pt/members", filename: "pt-members.png" },
    { url: "/pt/check-in", filename: "pt-check-in.png" },
    { url: "/pt/profile", filename: "pt-profile.png" },
  ]

  for (const item of ptPages) {
    test(`Capture ${item.url}`, async ({ page }) => {
      await openPage(page, item.url)
      await page.screenshot({ path: path.join(screenshotDir, item.filename), fullPage: true })
    })
  }
})

test.describe("Member Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member@gymmaster.local", /\/member\/dashboard$/)
  })

  const memberPages = [
    { url: "/member/dashboard", filename: "member-dashboard.png" },
    { url: "/member/workout", filename: "member-workout.png" },
    { url: "/member/nutrition/meal-journal", filename: "member-meal-journal.png" },
    { url: "/member/nutrition/summary", filename: "member-nutrition-summary.png" },
    { url: "/member/progress", filename: "member-progress.png" },
    { url: "/member/membership", filename: "member-membership.png" },
    // Query vnp_* la thu VNPay sandbox redirect ve that; vnp_ResponseCode=00 =
    // thanh cong -> chup duoc man ket qua thay vi man loi.
    {
      url: "/member/membership/vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=8001",
      filename: "member-vnpay-return.png",
    },
    { url: "/member/notes", filename: "member-notes.png" },
    { url: "/member/profile", filename: "member-profile.png" },
    { url: "/member/profile/edit", filename: "member-profile-edit.png" },
  ]

  for (const item of memberPages) {
    test(`Capture ${item.url}`, async ({ page }) => {
      await openPage(page, item.url)
      await page.screenshot({ path: path.join(screenshotDir, item.filename), fullPage: true })
    })
  }
})
