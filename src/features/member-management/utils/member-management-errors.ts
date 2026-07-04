import { ApiClientError } from "@/lib/api/http-client"
import type { MemberManagementError } from "@/features/member-management/types/member-management.types"

const messages: Record<string, string> = {
  DUPLICATE: "Email hoặc số điện thoại đã tồn tại.",
  FORBIDDEN: "Bạn không có quyền quản lý bản ghi này.",
  INVALID_ROLE: "Tài khoản liên kết không có vai trò PT.",
  NOT_FOUND: "Không tìm thấy bản ghi này.",
  ROLE_TRANSITION_NOT_ALLOWED:
    "Vai trò được gán khi tạo tài khoản và không thể thay đổi. Muốn đổi vai trò: tạo tài khoản mới ở màn tương ứng và khóa/xóa tài khoản cũ.",
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
