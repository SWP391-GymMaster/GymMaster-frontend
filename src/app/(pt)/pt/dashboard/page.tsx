import { PtDashboardContent } from "@/features/pt-dashboard/components/PtDashboardContent"
import { PtPageFrame } from "@/features/pt-dashboard/components/PtPageFrame"

export default function PtDashboardPage() {
  return (
    <PtPageFrame
      description="Coach overview of your assigned members, their status, and quick links to member 360 profiles."
      title="PT Dashboard"
    >
      <PtDashboardContent />
    </PtPageFrame>
  )
}
