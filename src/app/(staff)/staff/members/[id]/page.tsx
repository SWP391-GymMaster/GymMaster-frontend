import { StaffMemberDetailHero } from "@/features/staff-front-desk/components/StaffMemberDetailHero"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffMemberDetailPage() {
  return (
    <StaffPageFrame
      description="Inspect membership, payment, and recent check-in context before choosing the next front desk action."
      metrics={[
        { label: "Member context", value: "Membership + payment", tone: "dark" },
        { label: "Front desk action", value: "Sell, renew, or check in" },
        { label: "Access boundary", value: "Staff operations only" },
      ]}
      title="Member Detail"
    >
      <StaffMemberDetailHero />
    </StaffPageFrame>
  )
}
