import { test, type Browser, type Page } from "@playwright/test"
import fs from "fs"
import path from "path"

type AppRole = "admin" | "staff" | "pt" | "member"

type RouteTarget = {
  url: string
  filename: string
}

type CaptureRecord = {
  group: string
  sourceUrl: string
  finalUrl?: string
  file?: string
  ok: boolean
  status?: number | null
  error?: string
}

const screenshotRoot = path.join(
  process.cwd(),
  "docs",
  "ux-audit",
  "2026-06-30-apple-fitness-rework",
  "baseline",
  "desktop",
)

const desktopViewport = { width: 1440, height: 1100 }

const publicRoutes: RouteTarget[] = [
  { url: "/", filename: "root-redirect.png" },
  { url: "/welcome", filename: "welcome.png" },
  { url: "/about", filename: "about.png" },
  { url: "/login", filename: "login.png" },
  { url: "/signup", filename: "signup.png" },
  { url: "/forgot-password", filename: "forgot-password.png" },
  {
    url: "/reset-password?token=mock-reset-token&email=member%40gymmaster.local",
    filename: "reset-password.png",
  },
]

const protectedAuthRoutes: RouteTarget[] = [
  { url: "/change-password", filename: "change-password.png" },
]

const routesByRole: Record<AppRole, RouteTarget[]> = {
  admin: [
    { url: "/admin/dashboard", filename: "dashboard.png" },
    { url: "/admin/users", filename: "users.png" },
    { url: "/admin/staff", filename: "staff.png" },
    { url: "/admin/trainers", filename: "trainers.png" },
    { url: "/admin/members", filename: "members.png" },
    { url: "/admin/members/101", filename: "member-detail-101.png" },
    { url: "/admin/packages", filename: "packages.png" },
    { url: "/admin/memberships", filename: "memberships.png" },
    { url: "/admin/payments", filename: "payments.png" },
    { url: "/admin/assignments", filename: "assignments.png" },
    { url: "/admin/audit-logs", filename: "audit-logs.png" },
    { url: "/admin/notifications", filename: "notifications.png" },
  ],
  staff: [
    { url: "/staff/dashboard", filename: "dashboard.png" },
    { url: "/staff/members", filename: "members.png" },
    { url: "/staff/members/101", filename: "member-detail-101.png" },
    { url: "/staff/sell-package", filename: "sell-package.png" },
    { url: "/staff/renew-package", filename: "renew-package.png" },
    { url: "/staff/check-in", filename: "check-in.png" },
    { url: "/staff/payments", filename: "payments.png" },
  ],
  pt: [
    { url: "/pt/dashboard", filename: "dashboard.png" },
    { url: "/pt/members", filename: "members.png" },
    { url: "/pt/check-in", filename: "check-in.png" },
    { url: "/pt/members/101", filename: "member-360-101.png" },
    { url: "/pt/members/101/workout", filename: "member-workout-101.png" },
    { url: "/pt/members/101/notes", filename: "member-notes-101.png" },
    { url: "/pt/members/101/progress", filename: "member-progress-101.png" },
  ],
  member: [
    { url: "/member/dashboard", filename: "dashboard.png" },
    { url: "/member/membership", filename: "membership.png" },
    {
      url: "/member/membership/vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=mock",
      filename: "membership-vnpay-return.png",
    },
    { url: "/member/notes", filename: "notes.png" },
    { url: "/member/workout", filename: "workout.png" },
    { url: "/member/progress", filename: "progress.png" },
    { url: "/member/nutrition/meal-journal", filename: "nutrition-meal-journal.png" },
    { url: "/member/nutrition/summary", filename: "nutrition-summary.png" },
  ],
}

const roleEmails: Record<AppRole, string> = {
  admin: "admin@gymmaster.local",
  staff: "staff@gymmaster.local",
  pt: "pt@gymmaster.local",
  member: "member@gymmaster.local",
}

const dashboardPatterns: Record<AppRole, RegExp> = {
  admin: /\/admin\/dashboard$/,
  staff: /\/staff\/dashboard$/,
  pt: /\/pt\/dashboard$/,
  member: /\/member\/dashboard$/,
}

const captures: CaptureRecord[] = []

test.describe.configure({ mode: "serial" })
test.setTimeout(240_000)

test.beforeAll(() => {
  fs.mkdirSync(screenshotRoot, { recursive: true })
})

test.afterAll(() => {
  const manifestPath = path.join(screenshotRoot, "manifest.json")
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        viewport: desktopViewport,
        mode: "MSW mock, light theme, lime accent",
        captures,
      },
      null,
      2,
    ),
  )
})

test("capture desktop baseline for all implemented routes", async ({ browser }) => {
  const publicContext = await createDesktopContext(browser)
  const publicPage = await publicContext.newPage()

  for (const route of publicRoutes) {
    await captureRoute(publicPage, "public", route)
  }

  await publicContext.close()

  const memberContext = await createDesktopContext(browser)
  const memberPage = await memberContext.newPage()
  await loginAs(memberPage, "member")

  for (const route of protectedAuthRoutes) {
    await captureRoute(memberPage, "auth-protected", route)
  }

  await memberContext.close()

  for (const role of Object.keys(routesByRole) as AppRole[]) {
    const context = await createDesktopContext(browser)
    const page = await context.newPage()
    await loginAs(page, role)

    for (const route of routesByRole[role]) {
      await captureRoute(page, role, route)
    }

    if (role === "member") {
      await captureMemberProgressDialog(page)
    }

    await context.close()
  }

  const failures = captures.filter((item) => !item.ok)
  if (failures.length > 0) {
    throw new Error(
      `Screenshot capture failed for ${failures
        .map((item) => `${item.group}:${item.sourceUrl}`)
        .join(", ")}`,
    )
  }
})

async function createDesktopContext(browser: Browser) {
  const context = await browser.newContext({
    viewport: desktopViewport,
    colorScheme: "light",
    reducedMotion: "reduce",
  })

  await context.addInitScript(() => {
    window.localStorage.setItem(
      "gymmaster-sidebar-state",
      JSON.stringify({
        state: {
          isCollapsed: false,
          theme: "light",
          colorPreset: "lime",
          isSettingsOpen: false,
        },
        version: 0,
      }),
    )
  })

  return context
}

async function loginAs(page: Page, role: AppRole) {
  await page.goto("/login", { waitUntil: "domcontentloaded" })
  await waitForMsw(page)
  await page.getByTestId("login-email-input").fill(roleEmails[role])
  await page.getByTestId("login-password-input").fill("Password123!")
  await page.getByTestId("login-submit-button").click()
  await page.waitForURL(dashboardPatterns[role], { timeout: 15_000 })
}

async function captureRoute(page: Page, group: string, route: RouteTarget) {
  const targetDir = path.join(screenshotRoot, group)
  const targetPath = path.join(targetDir, route.filename)

  fs.mkdirSync(targetDir, { recursive: true })

  try {
    const response = await page.goto(route.url, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })

    await waitForMsw(page)
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined)
    await page.waitForTimeout(1_000)
    await page.screenshot({ path: targetPath, fullPage: true })

    captures.push({
      group,
      sourceUrl: route.url,
      finalUrl: new URL(page.url()).pathname + new URL(page.url()).search,
      file: path.relative(process.cwd(), targetPath).replace(/\\/g, "/"),
      ok: true,
      status: response?.status() ?? null,
    })
  } catch (error) {
    captures.push({
      group,
      sourceUrl: route.url,
      finalUrl: safePageUrl(page),
      file: path.relative(process.cwd(), targetPath).replace(/\\/g, "/"),
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

async function captureMemberProgressDialog(page: Page) {
  const group = "interactions"
  const sourceUrl = "/member/progress#record-dialog"
  const targetDir = path.join(screenshotRoot, group)
  const targetPath = path.join(targetDir, "member-progress-record-dialog.png")

  fs.mkdirSync(targetDir, { recursive: true })

  try {
    await page.goto("/member/progress", {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })
    await waitForMsw(page)
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined)
    await page.getByTestId("member-progress-trigger").click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: targetPath, fullPage: true })

    captures.push({
      group,
      sourceUrl,
      finalUrl: safePageUrl(page),
      file: path.relative(process.cwd(), targetPath).replace(/\\/g, "/"),
      ok: true,
      status: null,
    })
  } catch (error) {
    captures.push({
      group,
      sourceUrl,
      finalUrl: safePageUrl(page),
      file: path.relative(process.cwd(), targetPath).replace(/\\/g, "/"),
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

async function waitForMsw(page: Page) {
  await page.waitForFunction(
    () => window.__GYMMASTER_MSW_READY__ === true,
    undefined,
    { timeout: 15_000 },
  )
}

function safePageUrl(page: Page) {
  try {
    const url = new URL(page.url())
    return url.pathname + url.search
  } catch {
    return page.url()
  }
}
