import {
  AuthOSShell,
  AuthSecurityBadge,
  AuthTextLink,
} from "@/features/auth/components/AuthOSShell"
import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <AuthOSShell
      description="Đăng nhập bằng tài khoản GymMaster. Hệ thống sẽ mở đúng workspace theo vai trò backend trả về."
      footer={
        <>
          Hội viên mới? <AuthTextLink href="/signup">Tạo tài khoản</AuthTextLink>
          <AuthSecurityBadge />
        </>
      }
      title="Chào mừng quay lại."
    >
      <LoginForm />
    </AuthOSShell>
  )
}
