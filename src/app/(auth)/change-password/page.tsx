import {
  AuthOSShell,
} from "@/features/auth/components/AuthOSShell"
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm"
import { CurrentDashboardLink } from "@/features/auth/components/CurrentDashboardLink"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"

export default function ChangePasswordPage() {
  return (
    <PermissionGuard allowedRoles={["admin", "staff", "pt", "member"]}>
      <AuthOSShell
        description="Cập nhật mật khẩu bằng phiên đăng nhập hiện tại."
        footer={
          <>
            Hoàn tất? <CurrentDashboardLink />
          </>
        }
        title="Đổi mật khẩu"
      >
        <ChangePasswordForm />
      </AuthOSShell>
    </PermissionGuard>
  )
}
