import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { server } from "@/mocks/server"

describe("MSW server", () => {
  it("handles a mocked request", async () => {
    server.use(
      http.get("https://gymmaster.test/health", () =>
        HttpResponse.json({ success: true })
      )
    )

    const response = await fetch("https://gymmaster.test/health")
    const data = (await response.json()) as { success: boolean }

    expect(data.success).toBe(true)
  })
})
