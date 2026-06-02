import { ApiClientError } from "@/lib/api/http-client"

const messages: Record<string, string> = {
  ALREADY_ASSIGNED: "This member already has an active PT. Use change PT to reassign.",
  FORBIDDEN: "You do not have permission to assign trainers.",
  NOT_FOUND: "The selected member or trainer could not be found.",
  UNAUTHORIZED: "Please sign in again.",
  VALIDATION_ERROR: "Select one member and one trainer before confirming.",
}

export function mapPtAssignmentError(error: unknown) {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: messages[error.code] ?? "Could not complete this assignment.",
    }
  }

  return {
    code: "UNKNOWN",
    message: "Could not complete this assignment.",
  }
}
