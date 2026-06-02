import { PtDashboardContent } from "@/features/pt-dashboard/components/PtDashboardContent"
import { PtPageFrame } from "@/features/pt-dashboard/components/PtPageFrame"

export default function PtDashboardPage() {
  return (
    <PtPageFrame
      description="Tổng quan hội viên được phân công, trạng thái gói tập và lối vào nhanh hồ sơ 360."
      title="Coach hub PT"
    >
      <PtDashboardContent />
    </PtPageFrame>
  )
}
