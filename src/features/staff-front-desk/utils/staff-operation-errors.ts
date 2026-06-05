import { ApiClientError } from "@/lib/api/http-client"

const staffErrorMessages: Record<string, string> = {
  FORBIDDEN: "Bạn không có quyền truy cập khu vực này.",
  NOT_FOUND: "Không tìm thấy hội viên hoặc bản ghi thao tác.",
  PAYMENT_PENDING:
    "Check-in bị từ chối vì gói hội viên đang chờ thanh toán.",
  NO_ACTIVE_MEMBERSHIP:
    "Check-in bị từ chối vì hội viên chưa có gói đang hoạt động.",
  MEMBERSHIP_INACTIVE:
    "Check-in bị từ chối vì hội viên chưa có gói đang hoạt động.",
  VALIDATION_ERROR: "Vui lòng kiểm tra thông tin và thử lại.",
  NETWORK_ERROR: "Không thể kết nối dịch vụ GymMaster. Vui lòng thử lại.",
}

export function mapStaffOperationError(error: unknown) {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message:
        staffErrorMessages[error.code] ??
        error.message ??
        "GymMaster không thể hoàn tất thao tác lễ tân này.",
    }
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "GymMaster không thể hoàn tất thao tác lễ tân này.",
  }
}
