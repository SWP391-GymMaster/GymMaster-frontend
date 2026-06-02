import { StaffDashboard } from "@/features/staff-front-desk/components/StaffDashboard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffDashboardPage() {
  return (
    <StaffPageFrame
      description="Trung tâm lễ tân cho tìm hội viên, bán/gia hạn gói, check-in và theo dõi thanh toán thủ công."
      title="Bảng điều khiển lễ tân"
    >
      <StaffDashboard />
    </StaffPageFrame>
  )
}
