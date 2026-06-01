import { describe, expect, it } from "vitest"

import { dashboardByRole, normalizeRoleRedirect } from "@/lib/auth/roles"

describe("role dashboard routing", () => {
  it("maps every authenticated role to the required dashboard route", () => {
    expect(dashboardByRole).toEqual({
      admin: "/admin/dashboard",
      staff: "/staff/dashboard",
      pt: "/pt/dashboard",
      member: "/member/dashboard",
    })
  })

  it("rejects missing and unknown roles", () => {
    expect(normalizeRoleRedirect(undefined)).toBeNull()
    expect(normalizeRoleRedirect("owner")).toBeNull()
  })
})
