import { ApiClientError } from "@/lib/api/http-client"

const messages: Record<string, string> = {
  ALREADY_ASSIGNED:
    "Hội viên này đang có PT active. Hãy kết thúc assignment cũ trước khi phân công mới.",
  FORBIDDEN: "Bạn không có quyền phân công PT.",
  NOT_FOUND: "Không tìm thấy hội viên hoặc PT đã chọn.",
  UNAUTHORIZED: "Vui lòng đăng nhập lại.",
  VALIDATION_ERROR: "Chọn một hội viên và một PT trước khi xác nhận.",
}

export function mapPtAssignmentError(error: unknown) {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: messages[error.code] ?? "Không thể hoàn tất phân công PT.",
    }
  }

  return {
    code: "UNKNOWN",
    message: "Không thể hoàn tất phân công PT.",
  }
}
