import { MembershipGate } from "@/features/auth/components/MembershipGate"
import { MemberWorkoutWorkspace } from "@/features/pt-training/components/MemberTrainingWorkspaces"

export default function Page() {
  return (
    <MembershipGate>
      <MemberWorkoutWorkspace />
    </MembershipGate>
  )
}
