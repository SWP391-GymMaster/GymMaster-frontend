import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"

export default function AdminTrainersPage() {
  return (
    <AdminPageFrame
      description="Create PT profiles and review coaching specialties."
      title="PT Management"
    >
      <ManagementWorkspace mode="trainers" />
    </AdminPageFrame>
  )
}
