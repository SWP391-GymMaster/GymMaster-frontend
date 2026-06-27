import { PtCheckInContent } from "@/features/pt-dashboard/components/PtCheckInContent"
import { PtPageFrame } from "@/features/pt-dashboard/components/PtPageFrame"

export default function PtCheckInPage() {
  return (
    <PtPageFrame
      description="Điểm danh nhanh cho các học viên được phân công cho bạn, không cần qua quầy lễ tân."
      title="Check-in học viên"
    >
      <PtCheckInContent />
    </PtPageFrame>
  )
}
