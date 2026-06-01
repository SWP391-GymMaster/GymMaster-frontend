import { describe, expect, it } from "vitest"

import { mapAuthError } from "@/features/auth/utils/auth-error-map"
import { ApiClientError } from "@/lib/api/http-client"

describe("auth error mapper", () => {
  it("maps invalid credentials to a safe generic message", () => {
    const error = mapAuthError(
      new ApiClientError({
        code: "INVALID_CREDENTIALS",
        message: "Email does not exist",
      }),
    )

    expect(error.message).toBe("Email or password is incorrect.")
  })

  it("maps missing role without suggesting role selection", () => {
    const error = mapAuthError(
      new ApiClientError({
        code: "MISSING_ROLE",
        message: "Missing role",
      }),
    )

    expect(error.message).toContain("missing a valid role")
    expect(error.message).not.toMatch(/choose|select|picker/i)
  })
})
