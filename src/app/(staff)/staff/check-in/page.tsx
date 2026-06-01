import { CheckInTerminal } from "@/features/staff-front-desk/components/CheckInTerminal"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffCheckInPage() {
  return (
    <StaffPageFrame
      description="Validate membership and account status before confirming front desk entry."
      metrics={[
        { label: "Terminal", value: "Fast lookup", tone: "dark" },
        { label: "Gate rule", value: "Active paid access" },
        { label: "Denied state", value: "Clear next action" },
      ]}
      title="Check-in Terminal"
    >
      <CheckInTerminal />
    </StaffPageFrame>
  )
}
