import { MembershipGate } from "@/features/auth/components/MembershipGate"
import { MemberTrainerNotesWorkspace } from "@/features/pt-training/components/MemberTrainingWorkspaces"

export default function Page() {
  return (
    <MembershipGate>
      <MemberTrainerNotesWorkspace />
    </MembershipGate>
  )
}
