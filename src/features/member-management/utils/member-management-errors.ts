import { ApiClientError } from "@/lib/api/http-client"
import type { MemberManagementError } from "@/features/member-management/types/member-management.types"

const messages: Record<string, string> = {
  DUPLICATE: "Email hoặc số điện thoại đã tồn tại.",
  FORBIDDEN: "Bạn không có quyền quản lý bản ghi này.",
  NOT_FOUND: "Không tìm thấy bản ghi này.",
  UNAUTHORIZED: "Vui lòng đăng nhập lại.",
  VALIDATION_ERROR: "Vui lòng kiểm tra các trường trong form.",
}

export function mapMemberManagementError(error: unknown): MemberManagementError {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: messages[error.code] ?? "Không thể hoàn tất thao tác quản lý.",
    }
  }

  return {
    code: "UNKNOWN",
    message: "Không thể hoàn tất thao tác quản lý.",
  }
}
