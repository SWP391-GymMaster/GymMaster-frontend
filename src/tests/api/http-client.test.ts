import { describe, expect, it } from "vitest"

import { normalizeApiPath, parseApiResponse } from "@/lib/api/http-client"

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

describe("normalizeApiPath", () => {
  it("adds the canonical v1 prefix for logical API paths", () => {
    expect(normalizeApiPath("/api/members")).toBe("/api/v1/members")
    expect(normalizeApiPath("/api/members?query=an")).toBe(
      "/api/v1/members?query=an",
    )
    expect(normalizeApiPath("/api")).toBe("/api/v1")
  })

  it("does not rewrite paths that are already versioned or non-API routes", () => {
    expect(normalizeApiPath("/api/v1/auth/login")).toBe(
      "/api/v1/auth/login",
    )
    expect(normalizeApiPath("/apix/members")).toBe("/apix/members")
    expect(normalizeApiPath("/welcome")).toBe("/welcome")
  })
})

describe("parseApiResponse", () => {
  it("normalizes empty unauthorized responses", async () => {
    await expect(
      parseApiResponse(new Response(null, { status: 401 })),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    })
  })

  it("normalizes empty forbidden responses", async () => {
    await expect(
      parseApiResponse(new Response(null, { status: 403 })),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    })
  })

  it("preserves structured backend error envelopes", async () => {
    await expect(
      parseApiResponse(
        jsonResponse(
          {
            success: false,
            data: null,
            error: {
              code: "SESSION_EXPIRED",
              message: "Phiên đăng nhập đã hết hạn.",
              requestId: "request-123",
            },
            meta: null,
          },
          401,
        ),
      ),
    ).rejects.toMatchObject({
      code: "SESSION_EXPIRED",
      message: "Phiên đăng nhập đã hết hạn.",
      requestId: "request-123",
      status: 401,
    })
  })

  it("keeps invalid non-protected responses as invalid response errors", async () => {
    await expect(
      parseApiResponse(new Response("Service unavailable", { status: 500 })),
    ).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      status: 500,
    })
  })

  it("unwraps successful response envelopes", async () => {
    await expect(
      parseApiResponse(
        jsonResponse({
          success: true,
          data: {
            id: 101,
          },
          error: null,
          meta: null,
        }),
      ),
    ).resolves.toEqual({
      id: 101,
    })
  })

  it("keeps no-content responses empty", async () => {
    await expect(
      parseApiResponse(new Response(null, { status: 204 })),
    ).resolves.toBeUndefined()
  })
})
