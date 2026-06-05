import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AdminNotificationsContent } from "@/features/notifications/components/AdminNotificationsContent"

export default function AdminNotificationsPage() {
  return (
    <AdminPageFrame
      description="Quản lý toàn bộ lịch sử thông báo bảo mật, hoạt động check-in, thanh toán và vận hành của hệ thống GymMaster."
      title="Trung tâm Thông báo"
    >
      <AdminNotificationsContent />
    </AdminPageFrame>
  )
}
