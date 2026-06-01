import { StaffDashboard } from "@/features/staff-front-desk/components/StaffDashboard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffDashboardPage() {
  return (
    <StaffPageFrame
      description="Front desk command center for member lookup, package sales, renewals, check-in, and manual payment follow-up."
      metrics={[
        { label: "Today operations", value: "Front desk ready", tone: "dark" },
        { label: "Primary flow", value: "Search -> sell/renew -> check-in" },
        { label: "Access", value: "Staff only" },
      ]}
      title="Staff Dashboard"
    >
      <StaffDashboard />
    </StaffPageFrame>
  )
}
