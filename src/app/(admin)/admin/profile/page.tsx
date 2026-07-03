import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { AccountProfileWorkspace } from "@/features/account/components/AccountProfileWorkspace"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"

export default function AdminProfilePage() {
  return (
    <PermissionGuard allowedRoles={["admin"]}>
      <WorkspaceShell
        description="Quản lý hồ sơ cá nhân, tài khoản và bảo mật của quản trị viên."
        role="admin"
        title="Hồ sơ của tôi"
      >
        <AccountProfileWorkspace role="admin" />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
