import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { CalorieSummaryWorkspace } from "@/features/member-nutrition/components/CalorieSummaryWorkspace"

export default function MemberNutritionSummaryPage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Xem calo đã ăn, mục tiêu, phần còn lại và các bữa đã ghi hôm nay."
        metrics={[
          { label: "Tổng kết", value: "Theo ngày", tone: "dark" },
          { label: "Macro", value: "Theo contract" },
          { label: "Tracking", value: "Nhập tay" },
        ]}
        role="member"
        title="Tổng kết calo"
      >
        <CalorieSummaryWorkspace />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
