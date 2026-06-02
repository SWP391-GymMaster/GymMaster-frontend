import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffMembersPage() {
  return (
    <StaffPageFrame
      description="Tìm theo mã hội viên, số điện thoại, email hoặc tên rồi mở trạng thái vận hành."
      metrics={[
        { label: "Tra cứu", value: "Mã, SĐT, email, tên", tone: "dark" },
        { label: "Ngữ cảnh", value: "Hiện trạng gói tập" },
        { label: "Bước tiếp", value: "Mở chi tiết" },
      ]}
      title="Tìm hội viên"
    >
      <ManagementWorkspace detailBasePath="/staff/members" mode="members" />
    </StaffPageFrame>
  )
}
