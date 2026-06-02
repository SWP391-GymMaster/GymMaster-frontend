import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AdminPtAssignmentWorkspace } from "@/features/pt-assignment/components/AdminPtAssignmentWorkspace"

export default function AdminAssignmentsPage() {
  return (
    <AdminPageFrame
      description="Phân công PT cho hội viên theo rule một PT active và giữ bằng chứng audit."
      title="Phân công PT"
    >
      <AdminPtAssignmentWorkspace />
    </AdminPageFrame>
  )
}
