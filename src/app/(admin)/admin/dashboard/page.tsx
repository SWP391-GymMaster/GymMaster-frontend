import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AdminDashboardContent } from "@/features/admin-dashboard/components/AdminDashboardContent"

export default function AdminDashboardPage() {
  return (
    <AdminPageFrame
      description="Trung tâm vận hành doanh thu, trạng thái gói tập, nhịp check-in và truy cập nhanh khu quản lý."
      title="Bảng điều khiển Admin"
    >
      <AdminDashboardContent />
    </AdminPageFrame>
  )
}
