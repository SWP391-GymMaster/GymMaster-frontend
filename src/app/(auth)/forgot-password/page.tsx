import {
  AuthOSShell,
  BackToLoginLink,
} from "@/features/auth/components/AuthOSShell"
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <AuthOSShell
      description="Nhập email để tạo yêu cầu đặt lại mật khẩu."
      footer={<BackToLoginLink />}
      title="Đặt lại quyền truy cập"
    >
      <ForgotPasswordForm />
    </AuthOSShell>
  )
}
