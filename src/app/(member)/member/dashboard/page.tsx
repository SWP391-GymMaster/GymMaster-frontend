import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { MemberDashboardContent } from "@/features/member-nutrition/components/MemberDashboardContent"

export default function MemberDashboardPage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Trung tâm hằng ngày cho tập luyện, gói hội viên và dinh dưỡng."
        metrics={[
          { label: "Trọng tâm hôm nay", value: "Nhật ký ăn", tone: "dark" },
          { label: "Gói hội viên", value: "Hoạt động" },
          { label: "Giáo án", value: "Sẵn sàng" },
        ]}
        role="member"
        title="Bảng điều khiển hội viên"
      >
        <MemberDashboardContent />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
