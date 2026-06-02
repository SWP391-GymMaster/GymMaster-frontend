import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"

export default function AdminTrainersPage() {
  return (
    <AdminPageFrame
      description="Tạo hồ sơ PT và xem chuyên môn huấn luyện."
      title="Quản lý PT"
    >
      <ManagementWorkspace mode="trainers" />
    </AdminPageFrame>
  )
}
