import { CheckInTerminal } from "@/features/staff-front-desk/components/CheckInTerminal"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffCheckInPage() {
  return (
    <StaffPageFrame
      description="Kiểm tra gói hội viên và trạng thái tài khoản trước khi xác nhận vào phòng tập."
      metrics={[
        { label: "Terminal", value: "Tra cứu nhanh", tone: "dark" },
        { label: "Rule vào cửa", value: "Gói paid active" },
        { label: "Từ chối", value: "Có hướng xử lý" },
      ]}
      title="Terminal check-in"
    >
      <CheckInTerminal />
    </StaffPageFrame>
  )
}
