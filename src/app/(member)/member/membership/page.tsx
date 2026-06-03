import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { MemberMembershipDetails } from "@/features/billing/components/MemberMembershipDetails"

export default function MemberMembershipPage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Theo dõi chi tiết về gói tập đăng ký, huấn luyện viên cá nhân và lịch sử hóa đơn thanh toán của bạn."
        role="member"
        title="Gói tập & Hóa đơn"
      >
        <MemberMembershipDetails />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
