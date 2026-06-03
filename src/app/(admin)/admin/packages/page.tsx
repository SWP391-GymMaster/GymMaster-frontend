import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { PackageListWorkspace } from "@/features/billing/components/PackageListWorkspace"

export default function AdminPackagesPage() {
  return (
    <AdminPageFrame
      title="Cấu hình gói tập"
      description="Quản lý thông tin giá cả, thời hạn và trạng thái của các gói tập thành viên."
    >
      <PackageListWorkspace />
    </AdminPageFrame>
  )
}
