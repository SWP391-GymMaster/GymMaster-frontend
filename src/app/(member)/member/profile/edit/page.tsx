import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { MemberProfileWorkspace } from "@/features/member-profile/components/MemberProfileWorkspace"

export default function Page() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Cập nhật thông tin cá nhân để quầy lễ tân và PT nhận diện bạn chính xác hơn."
        role="member"
        title="Chỉnh sửa hồ sơ"
      >
        <MemberProfileWorkspace />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
