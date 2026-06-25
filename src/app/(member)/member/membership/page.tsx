import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { MemberMembershipDetails } from "@/features/billing/components/MemberMembershipDetails"

export default function MemberMembershipPage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Xem gói hiện tại, mua/đổi gói tập và lịch sử hóa đơn thanh toán của bạn."
        role="member"
        title="Gói tập"
      >
        <MemberMembershipDetails />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
