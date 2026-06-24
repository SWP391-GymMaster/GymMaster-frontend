import { MembershipGate } from "@/features/auth/components/MembershipGate"
import { MemberProgressWorkspace } from "@/features/member-progress-tracking/components/MemberProgressWorkspace"

export default function Page() {
  return (
    <MembershipGate>
      <MemberProgressWorkspace />
    </MembershipGate>
  )
}
