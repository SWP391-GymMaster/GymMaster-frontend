import { StaffMemberDetailHero } from "@/features/staff-front-desk/components/StaffMemberDetailHero"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffMemberDetailPage() {
  return (
    <StaffPageFrame
      description="Xem gói tập, thanh toán và check-in gần đây trước khi chọn thao tác lễ tân tiếp theo."
      metrics={[
        { label: "Ngữ cảnh hội viên", value: "Gói + thanh toán", tone: "dark" },
        { label: "Thao tác lễ tân", value: "Bán, gia hạn, check-in" },
        { label: "Phạm vi quyền", value: "Chỉ lễ tân" },
      ]}
      title="Chi tiết hội viên"
    >
      <StaffMemberDetailHero />
    </StaffPageFrame>
  )
}
