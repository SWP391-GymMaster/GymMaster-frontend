import { CheckInTerminal } from "@/features/staff-front-desk/components/CheckInTerminal"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffCheckInPage() {
  return (
    <StaffPageFrame
      description="Kiểm tra gói hội viên và trạng thái tài khoản trước khi xác nhận vào phòng tập."
      title="Terminal check-in"
    >
      <CheckInTerminal />
    </StaffPageFrame>
  )
}
