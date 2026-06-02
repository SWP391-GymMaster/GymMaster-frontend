import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AdminPtAssignmentWorkspace } from "@/features/pt-assignment/components/AdminPtAssignmentWorkspace"

export default function AdminAssignmentsPage() {
  return (
    <AdminPageFrame
      description="Assign or change a member's active PT while preserving ownership and audit evidence."
      title="PT Assignment"
    >
      <AdminPtAssignmentWorkspace />
    </AdminPageFrame>
  )
}
