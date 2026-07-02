import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { MemberProfileWorkspace } from "@/features/member-profile/components/MemberProfileWorkspace"

export default function MemberProfilePage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Xem thông tin tài khoản, cập nhật số điện thoại và bổ sung hồ sơ cá nhân của bạn."
        role="member"
        title="Hồ sơ của tôi"
      >
        <MemberProfileWorkspace />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
