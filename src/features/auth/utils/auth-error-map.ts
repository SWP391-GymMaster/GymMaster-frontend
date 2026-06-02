import { ApiClientError } from "@/lib/api/http-client"
import type { AuthError } from "@/types/auth"

const authErrorMessages: Record<string, string> = {
  VALIDATION_ERROR: "Please check your email and password.",
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Please wait before trying again.",
  ACCOUNT_LOCKED: "This account is locked. Please contact gym staff.",
  UNAUTHORIZED: "Your session is no longer valid. Please sign in again.",
  INVALID_REFRESH_TOKEN: "Your session has expired. Please sign in again.",
  MISSING_ROLE: "Your account is missing a valid role. Please contact support.",
  UNKNOWN_ROLE: "Your account role is not supported. Please contact support.",
  EMAIL_EXISTS: "This email is already registered.",
  PHONE_EXISTS: "This phone number is already registered.",
  INVALID_RESET_TOKEN: "This reset link is invalid or expired.",
  INVALID_CURRENT_PASSWORD: "Current password is incorrect.",
  NETWORK_ERROR: "Unable to reach GymMaster services. Please try again.",
}

export function mapAuthError(error: unknown): AuthError {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message:
        authErrorMessages[error.code] ??
        "Authentication failed. Please try again.",
      requestId: error.requestId,
    }
  }

  return {
    code: "UNKNOWN_AUTH_ERROR",
    message: "Authentication failed. Please try again.",
  }
}
