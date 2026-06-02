import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"

export default function AdminStaffPage() {
  return (
    <AdminPageFrame
      description="Tạo và theo dõi tài khoản lễ tân cho vận hành quầy."
      title="Quản lý lễ tân"
    >
      <ManagementWorkspace mode="staff" />
    </AdminPageFrame>
  )
}
