import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { MealJournalWorkspace } from "@/features/member-nutrition/components/MealJournalWorkspace"

export default function MemberMealJournalPage() {
  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Search food, log portions, and keep today's calorie summary current."
        metrics={[
          { label: "Journal mode", value: "Manual entry", tone: "dark" },
          { label: "Custom food", value: "Follow-up" },
          { label: "Image assist", value: "Out of MVP" },
        ]}
        role="member"
        title="Meal Journal"
      >
        <MealJournalWorkspace />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
