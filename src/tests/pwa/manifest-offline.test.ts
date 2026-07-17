import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import manifest from "@/app/manifest"

describe("GymMaster PWA manifest", () => {
  it("defines an installable standalone app without changing the auth entry flow", () => {
    const value = manifest()

    expect(value).toMatchObject({
      id: "/",
      short_name: "GymMaster",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#F4F4F5",
      theme_color: "#18181B",
      lang: "vi",
    })
    expect(value.name).toContain("GymMaster")
  })

  it("references regular and maskable PNG icons with valid public assets", () => {
    const icons = manifest().icons ?? []

    expect(icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192", purpose: "any" }),
        expect.objectContaining({ sizes: "512x512", purpose: "any" }),
        expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
      ]),
    )

    for (const icon of icons) {
      const publicPath = join(process.cwd(), "public", icon.src.replace(/^\//, ""))
      expect(readFileSync(publicPath).byteLength).toBeGreaterThan(0)
    }
  })
})

describe("GymMaster offline document", () => {
  const html = readFileSync(join(process.cwd(), "public", "offline.html"), "utf8")

  it("contains accessible Vietnamese status and retry controls", () => {
    const offlineDocument = new DOMParser().parseFromString(html, "text/html")

    expect(offlineDocument.documentElement.lang).toBe("vi")
    expect(offlineDocument.querySelector("main")?.getAttribute("aria-labelledby")).toBe("offline-title")
    expect(offlineDocument.querySelector('[role="status"]')?.textContent).toContain("không được lưu ngoại tuyến")
    expect(offlineDocument.querySelector("button")?.textContent).toBe("Thử kết nối lại")
    expect(offlineDocument.querySelector("button")?.getAttribute("type")).toBe("button")
  })

  it("does not embed protected data or an API/background-write flow", () => {
    expect(html).not.toContain("/api/")
    expect(html).not.toContain("localStorage")
    expect(html).not.toContain("fetch(")
    expect(html).not.toContain("BackgroundSync")
  })
})
