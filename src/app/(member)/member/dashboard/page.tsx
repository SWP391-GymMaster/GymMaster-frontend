import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { MemberDashboardContent } from "@/features/member-nutrition/components/MemberDashboardContent"

export default function MemberDashboardPage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Your daily training, membership, and nutrition command center."
        metrics={[
          { label: "Today focus", value: "Nutrition log", tone: "dark" },
          { label: "Membership", value: "Active" },
          { label: "Coach plan", value: "Next slice" },
        ]}
        role="member"
        title="Member Dashboard"
      >
        <MemberDashboardContent />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
