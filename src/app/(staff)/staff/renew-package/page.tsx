import { RenewPackageWizard } from "@/features/staff-front-desk/components/RenewPackageWizard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffRenewPackagePage() {
  return (
    <StaffPageFrame
      description="Extend an existing membership, preview the renewal period, and keep pending payment separate from active access."
      metrics={[
        { label: "Renewal", value: "Preview next period", tone: "dark" },
        { label: "Membership rule", value: "Extend from current end" },
        { label: "Payment action", value: "Manual confirmation" },
      ]}
      title="Renew Package"
    >
      <RenewPackageWizard />
    </StaffPageFrame>
  )
}
