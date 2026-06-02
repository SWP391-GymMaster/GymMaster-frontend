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
        description="Update your password using your current active session."
        footer={
          <>
            Finished? <CurrentDashboardLink />
          </>
        }
        title="Change password"
      >
        <ChangePasswordForm />
      </AuthOSShell>
    </PermissionGuard>
  )
}
