import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AuditLogsContent } from "@/features/admin-dashboard/components/AuditLogsContent"

export default function AuditLogsPage() {
  return (
    <AdminPageFrame
      description="Xem và lọc nhật ký audit cho các thao tác thay đổi dữ liệu trong GymMaster."
      title="Nhật ký audit"
    >
      <AuditLogsContent />
    </AdminPageFrame>
  )
}
