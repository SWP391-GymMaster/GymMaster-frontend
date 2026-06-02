import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffMembersPage() {
  return (
    <StaffPageFrame
      description="Tìm theo mã hội viên, số điện thoại, email hoặc tên rồi mở trạng thái vận hành."
      title="Tìm hội viên"
    >
      <ManagementWorkspace detailBasePath="/staff/members" mode="members" />
    </StaffPageFrame>
  )
}
