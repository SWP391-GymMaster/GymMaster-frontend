import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { AccountProfileWorkspace } from "@/features/account/components/AccountProfileWorkspace"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"

export default function StaffProfilePage() {
  return (
    <PermissionGuard allowedRoles={["staff"]}>
      <WorkspaceShell
        description="Cập nhật tài khoản, thông tin cá nhân và bảo mật dành cho lễ tân."
        role="staff"
        title="Hồ sơ của tôi"
      >
        <AccountProfileWorkspace role="staff" />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
