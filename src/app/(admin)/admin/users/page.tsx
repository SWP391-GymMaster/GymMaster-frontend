import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"

export default function AdminUsersPage() {
  return (
    <AdminPageFrame
      description="Create role-bound accounts and review active user access from backend spec 002."
      title="User Management"
    >
      <ManagementWorkspace mode="users" />
    </AdminPageFrame>
  )
}
