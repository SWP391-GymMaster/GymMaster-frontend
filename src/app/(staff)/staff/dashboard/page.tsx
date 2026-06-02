import { StaffDashboard } from "@/features/staff-front-desk/components/StaffDashboard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffDashboardPage() {
  return (
    <StaffPageFrame
      description="Trung tâm lễ tân cho tìm hội viên, bán/gia hạn gói, check-in và theo dõi thanh toán thủ công."
      metrics={[
        { label: "Vận hành hôm nay", value: "Sẵn sàng", tone: "dark" },
        { label: "Luồng chính", value: "Tìm -> bán/gia hạn -> check-in" },
        { label: "Quyền truy cập", value: "Lễ tân" },
      ]}
      title="Bảng điều khiển lễ tân"
    >
      <StaffDashboard />
    </StaffPageFrame>
  )
}
