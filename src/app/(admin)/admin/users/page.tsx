import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AdminUsersTemplateWorkspace } from "@/features/member-management/components/AdminUsersTemplateWorkspace"

export default function AdminUsersPage() {
  return (
    <AdminPageFrame
      description="Create role-bound accounts and review active user access from backend spec 002."
      title="User Management"
    >
      <AdminUsersTemplateWorkspace />
    </AdminPageFrame>
  )
}
