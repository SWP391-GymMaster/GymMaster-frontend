import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { MembershipsRoster } from "@/features/billing/components/MembershipsRoster"

export default function AdminMembershipsPage() {
  return (
    <AdminPageFrame
      title="Danh sách hợp đồng"
      description="Quản lý thông tin thời hạn đăng ký, trạng thái và thẻ thành viên của hội viên."
    >
      <MembershipsRoster />
    </AdminPageFrame>
  )
}
