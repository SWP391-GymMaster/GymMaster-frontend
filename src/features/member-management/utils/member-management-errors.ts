import { ApiClientError } from "@/lib/api/http-client"
import type { MemberManagementError } from "@/features/member-management/types/member-management.types"

const messages: Record<string, string> = {
  DUPLICATE: "Email or phone already exists.",
  FORBIDDEN: "You do not have permission to manage this record.",
  NOT_FOUND: "This record could not be found.",
  UNAUTHORIZED: "Please sign in again.",
  VALIDATION_ERROR: "Please check the form fields.",
}

export function mapMemberManagementError(error: unknown): MemberManagementError {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: messages[error.code] ?? "Could not complete this management action.",
    }
  }

  return {
    code: "UNKNOWN",
    message: "Could not complete this management action.",
  }
}
