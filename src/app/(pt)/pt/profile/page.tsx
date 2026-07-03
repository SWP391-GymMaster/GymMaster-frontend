import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { AccountProfileWorkspace } from "@/features/account/components/AccountProfileWorkspace"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"

export default function PtProfilePage() {
  return (
    <PermissionGuard allowedRoles={["pt"]}>
      <WorkspaceShell
        description="Xem hồ sơ chuyên môn, cập nhật thông tin cá nhân và bảo mật tài khoản PT."
        role="pt"
        title="Hồ sơ của tôi"
      >
        <AccountProfileWorkspace role="pt" />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
