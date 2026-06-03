import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { MealJournalWorkspace } from "@/features/member-nutrition/components/MealJournalWorkspace"

export default function MemberMealJournalPage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Tìm món, ghi khẩu phần và cập nhật tổng kết calo hôm nay."
        // metrics={[
        //   { label: "Chế độ ghi", value: "Nhập tay", tone: "dark" },
        //   { label: "Custom food", value: "Secondary" },
        //   { label: "Image assist", value: "Ngoài MVP" },
        // ]}
        role="member"
        title="Nhật ký ăn"
      >
        <MealJournalWorkspace />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
