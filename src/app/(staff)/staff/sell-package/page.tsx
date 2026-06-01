import { SellPackageWizard } from "@/features/staff-front-desk/components/SellPackageWizard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffSellPackagePage() {
  return (
    <StaffPageFrame
      description="Select a member, choose an active package, confirm sale details, and keep pending payment separate from active membership."
      metrics={[
        { label: "Sale state", value: "Pending until paid", tone: "dark" },
        { label: "Package source", value: "Mock API catalog" },
        { label: "Payment action", value: "Manual confirmation" },
      ]}
      title="Sell Package"
    >
      <SellPackageWizard />
    </StaffPageFrame>
  )
}
