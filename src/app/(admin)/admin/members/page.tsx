import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"

export default function AdminMembersPage() {
  return (
    <AdminPageFrame
      description="Tìm kiếm, tạo, cập nhật và soft-delete hồ sơ hội viên."
      title="Quản lý hội viên"
    >
      <ManagementWorkspace
        canDeleteMembers
        detailBasePath="/admin/members"
        mode="members"
      />
    </AdminPageFrame>
  )
}
