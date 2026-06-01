import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { CalorieSummaryWorkspace } from "@/features/member-nutrition/components/CalorieSummaryWorkspace"

export default function MemberNutritionSummaryPage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Review today's consumed calories, target, remaining balance, and logged meals."
        metrics={[
          { label: "Summary", value: "Daily", tone: "dark" },
          { label: "Macros", value: "Contract-ready" },
          { label: "Tracking", value: "Manual" },
        ]}
        role="member"
        title="Calorie Summary"
      >
        <CalorieSummaryWorkspace />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
