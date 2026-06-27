import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AdminDashboardContent } from "@/features/admin-dashboard/components/AdminDashboardContent"

export default function AdminDashboardPage() {
  return (
    <AdminPageFrame
      description="Theo dõi doanh thu, hội viên hoạt động, nhịp check-in và thanh toán chờ xử lý."
      title="Bảng điều khiển Admin"
    >
      <AdminDashboardContent />
    </AdminPageFrame>
  )
}
