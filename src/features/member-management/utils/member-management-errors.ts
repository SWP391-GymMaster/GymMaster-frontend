import { ApiClientError } from "@/lib/api/http-client"
import type { MemberManagementError } from "@/features/member-management/types/member-management.types"

const messages: Record<string, string> = {
  DUPLICATE: "Email hoac so dien thoai da ton tai.",
  FORBIDDEN: "Ban khong co quyen quan ly ban ghi nay.",
  INVALID_ROLE: "Tai khoan lien ket khong co vai tro PT.",
  NOT_FOUND: "Khong tim thay ban ghi nay.",
  ROLE_TRANSITION_NOT_ALLOWED:
    "Vai tro duoc gan khi tao tai khoan va khong the thay doi. Muon doi vai tro: tao tai khoan moi o man tuong ung va khoa/xoa tai khoan cu.",
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
