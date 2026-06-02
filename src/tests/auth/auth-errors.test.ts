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

  it("maps auth account management errors", () => {
    expect(
      mapAuthError(
        new ApiClientError({
          code: "EMAIL_EXISTS",
          message: "Email already exists",
        }),
      ).message,
    ).toBe("This email is already registered.")

    expect(
      mapAuthError(
        new ApiClientError({
          code: "INVALID_RESET_TOKEN",
          message: "Invalid reset token",
        }),
      ).message,
    ).toBe("This reset link is invalid or expired.")

    expect(
      mapAuthError(
        new ApiClientError({
          code: "INVALID_CURRENT_PASSWORD",
          message: "Invalid current password",
        }),
      ).message,
    ).toBe("Current password is incorrect.")
  })
})
