import { ApiClientError } from "@/lib/api/http-client"
import type { AuthError } from "@/types/auth"

const authErrorMessages: Record<string, string> = {
  VALIDATION_ERROR: "Vui lòng kiểm tra email và mật khẩu.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  TOO_MANY_ATTEMPTS: "Bạn thử quá nhiều lần. Vui lòng chờ trước khi thử lại.",
  ACCOUNT_LOCKED: "Tài khoản này đã bị khóa. Vui lòng liên hệ nhân viên phòng gym.",
  UNAUTHORIZED: "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.",
  INVALID_REFRESH_TOKEN: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  MISSING_ROLE: "Tài khoản chưa có vai trò hợp lệ. Vui lòng liên hệ hỗ trợ.",
  UNKNOWN_ROLE: "Vai trò tài khoản chưa được hỗ trợ. Vui lòng liên hệ hỗ trợ.",
  EMAIL_EXISTS: "Email này đã được đăng ký.",
  PHONE_EXISTS: "Số điện thoại này đã được đăng ký.",
  INVALID_RESET_TOKEN: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  INVALID_CURRENT_PASSWORD: "Mật khẩu hiện tại không đúng.",
  NETWORK_ERROR: "Không thể kết nối dịch vụ GymMaster. Vui lòng thử lại.",
}

export function mapAuthError(error: unknown): AuthError {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message:
        authErrorMessages[error.code] ??
        "Xác thực thất bại. Vui lòng thử lại.",
      requestId: error.requestId,
    }
  }

  return {
    code: "UNKNOWN_AUTH_ERROR",
    message: "Xác thực thất bại. Vui lòng thử lại.",
  }
}
