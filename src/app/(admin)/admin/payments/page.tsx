import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { PaymentsLogTable } from "@/features/billing/components/PaymentsLogTable"

export default function AdminPaymentsPage() {
  return (
    <AdminPageFrame
      title="Nhật ký thanh toán"
      description="Lịch sử hóa đơn giao dịch, phương thức và số tiền thanh toán của hội viên."
    >
      <PaymentsLogTable />
    </AdminPageFrame>
  )
}
