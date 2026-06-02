import { describe, expect, it } from "vitest"

import { normalizeApiPath } from "@/lib/api/http-client"

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
