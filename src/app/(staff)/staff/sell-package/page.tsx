import { SellPackageWizard } from "@/features/staff-front-desk/components/SellPackageWizard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffSellPackagePage() {
  return (
    <StaffPageFrame
      description="Chọn hội viên, chọn gói active, xác nhận bán gói và tách pending payment khỏi gói active."
      title="Bán gói tập"
    >
      <SellPackageWizard />
    </StaffPageFrame>
  )
}
