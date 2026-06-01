import { MemberSearchPanel } from "@/features/staff-front-desk/components/MemberSearchPanel"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffMembersPage() {
  return (
    <StaffPageFrame
      description="Search by member code, phone, email, or name, then open the member's operational status."
      metrics={[
        { label: "Lookup", value: "Code, phone, email, name", tone: "dark" },
        { label: "Result context", value: "Membership status visible" },
        { label: "Next action", value: "Open member detail" },
      ]}
      title="Member Search"
    >
      <MemberSearchPanel />
    </StaffPageFrame>
  )
}
