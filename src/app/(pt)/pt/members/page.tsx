import { PtMembersContent } from "@/features/pt-dashboard/components/PtMembersContent"
import { PtPageFrame } from "@/features/pt-dashboard/components/PtPageFrame"

export default function PtMembersPage() {
  return (
    <PtPageFrame
      description="Danh sách học viên huấn luyện cá nhân, theo dõi giáo án và cập nhật ghi chú HLV."
      title="Quản lý học viên"
    >
      <PtMembersContent />
    </PtPageFrame>
  )
}
