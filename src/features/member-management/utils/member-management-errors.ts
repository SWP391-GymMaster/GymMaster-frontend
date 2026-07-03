import { ApiClientError } from "@/lib/api/http-client"
import type { MemberManagementError } from "@/features/member-management/types/member-management.types"

const messages: Record<string, string> = {
  DUPLICATE: "Email hoac so dien thoai da ton tai.",
  FORBIDDEN: "Ban khong co quyen quan ly ban ghi nay.",
  INVALID_ROLE: "Tai khoan lien ket khong co vai tro PT.",
  NOT_FOUND: "Khong tim thay ban ghi nay.",
  ROLE_TRANSITION_NOT_ALLOWED:
    "Khong the chuyen vai tro giua nhan su van hanh va Hoi vien/PT. Dung man Hoi vien hoac Huan luyen vien.",
  UNAUTHORIZED: "Vui long dang nhap lai.",
  VALIDATION_ERROR: "Vui long kiem tra cac truong trong form.",
}

export function mapMemberManagementError(error: unknown): MemberManagementError {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: messages[error.code] ?? "Khong the hoan tat thao tac quan ly.",
    }
  }

  return {
    code: "UNKNOWN",
    message: "Khong the hoan tat thao tac quan ly.",
  }
}
