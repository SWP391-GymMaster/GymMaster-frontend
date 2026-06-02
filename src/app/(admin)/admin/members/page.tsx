import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"

export default function AdminMembersPage() {
  return (
    <AdminPageFrame
      description="Search, create, update, and soft-delete member profiles from backend spec 002."
      title="Member Management"
    >
      <ManagementWorkspace
        canDeleteMembers
        detailBasePath="/admin/members"
        mode="members"
      />
    </AdminPageFrame>
  )
}
