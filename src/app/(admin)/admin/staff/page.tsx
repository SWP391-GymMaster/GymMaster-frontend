import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"

export default function AdminStaffPage() {
  return (
    <AdminPageFrame
      description="Create and monitor Staff accounts for front desk operations."
      title="Staff Management"
    >
      <ManagementWorkspace mode="staff" />
    </AdminPageFrame>
  )
}
