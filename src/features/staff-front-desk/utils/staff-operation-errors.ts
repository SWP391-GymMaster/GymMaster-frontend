import { ApiClientError } from "@/lib/api/http-client"

const staffErrorMessages: Record<string, string> = {
  FORBIDDEN: "You do not have access to this workspace.",
  NOT_FOUND: "We could not find that member or operation record.",
  MEMBERSHIP_INACTIVE:
    "Check-in is denied because this member does not have an active membership.",
  VALIDATION_ERROR: "Please check the details and try again.",
  NETWORK_ERROR: "GymMaster services are not reachable. Please try again.",
}

export function mapStaffOperationError(error: unknown) {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message:
        staffErrorMessages[error.code] ??
        error.message ??
        "GymMaster could not complete this Staff operation.",
    }
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "GymMaster could not complete this Staff operation.",
  }
}
