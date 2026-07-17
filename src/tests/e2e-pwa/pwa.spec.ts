import { expect, test, type Page } from "@playwright/test"

async function ensurePwaControl(page: Page) {
  await page.goto("/welcome")
  await page.waitForFunction(() => "serviceWorker" in navigator)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload({ waitUntil: "domcontentloaded" })
  await expect
    .poll(
      () =>
        page.evaluate(
          () => navigator.serviceWorker.controller?.scriptURL ?? null,
        ),
      { timeout: 15_000 },
    )
    .toContain("/sw.js")
}

test("serves an installable manifest, icons, and protected worker headers", async ({
  request,
}) => {
  const manifestResponse = await request.get("/manifest.webmanifest")
  expect(manifestResponse.ok()).toBe(true)
  expect(manifestResponse.headers()["content-type"]).toContain("application/manifest+json")

  const manifest = (await manifestResponse.json()) as {
    display: string
    icons: Array<{ purpose?: string; sizes: string; src: string }>
    scope: string
    short_name: string
    start_url: string
  }
  expect(manifest).toMatchObject({
    display: "standalone",
    scope: "/",
    short_name: "GymMaster",
    start_url: "/",
  })
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
    ]),
  )

  for (const icon of manifest.icons) {
    const iconResponse = await request.get(icon.src)
    expect(iconResponse.ok(), `${icon.src} should be available`).toBe(true)
    expect(iconResponse.headers()["content-type"]).toContain("image/png")
  }

  const workerResponse = await request.get("/sw.js")
  const workerHeaders = workerResponse.headers()
  expect(workerResponse.ok()).toBe(true)
  expect(workerHeaders["content-type"]).toContain("application/javascript")
  expect(workerHeaders["cache-control"]).toBe("no-cache, no-store, must-revalidate")
  expect(workerHeaders["content-security-policy"]).toBe(
    "default-src 'self'; script-src 'self'",
  )
  expect(workerHeaders["x-content-type-options"]).toBe("nosniff")
})

test("registers the production worker and keeps protected traffic out of caches", async ({
  page,
}) => {
  await ensurePwaControl(page)

  await page.evaluate(async () => {
    await fetch("/api/pwa-cache-probe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ probe: true }),
    }).catch(() => undefined)
  })

  await page.goto("/login", { waitUntil: "domcontentloaded" })
  await expect(page.getByTestId("login-submit-button")).toBeVisible()
  await page.waitForTimeout(1_000)

  const cacheSnapshot = await page.evaluate(async () => {
    const names = await caches.keys()
    const urls = (
      await Promise.all(
        names.map(async (name) => {
          const cache = await caches.open(name)
          return (await cache.keys()).map((entry) => entry.url)
        }),
      )
    ).flat()

    return { names, urls }
  })

  expect(cacheSnapshot.names).toEqual(["gymmaster-pwa-static-v1"])
  expect(cacheSnapshot.urls).toEqual(
    expect.arrayContaining([
      expect.stringContaining("/offline.html"),
      expect.stringContaining("/icons/gymmaster-192.png"),
      expect.stringContaining("/icons/gymmaster-512.png"),
      expect.stringContaining("/icons/gymmaster-maskable-512.png"),
    ]),
  )
  expect(cacheSnapshot.urls.some((url) => url.includes("/api/"))).toBe(false)
  expect(cacheSnapshot.urls.some((url) => url.includes("/member/"))).toBe(false)
  expect(cacheSnapshot.urls.some((url) => url.includes("/login"))).toBe(false)
  expect(cacheSnapshot.urls.some((url) => url.includes("accounts.google.com"))).toBe(false)
  expect(cacheSnapshot.urls.some((url) => url.includes("_rsc="))).toBe(false)
})

test("shows live connectivity state and serves the branded offline document", async ({
  context,
  page,
}) => {
  await ensurePwaControl(page)

  await context.setOffline(true)
  try {
    await page.evaluate(() => window.dispatchEvent(new Event("offline")))
    await expect(page.getByRole("status")).toContainText(
      "Các thao tác đồng bộ với hệ thống cần kết nối mạng",
    )

    await page.goto("/member/dashboard", { waitUntil: "domcontentloaded" })
    await expect(
      page.getByRole("heading", { name: "Bạn đang ngoại tuyến" }),
    ).toBeVisible()
    await expect(page.getByRole("button", { name: "Thử kết nối lại" })).toBeVisible()
  } finally {
    await context.setOffline(false)
  }
})
