import { RenewPackageWizard } from "@/features/staff-front-desk/components/RenewPackageWizard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffRenewPackagePage() {
  return (
    <StaffPageFrame
      description="Gia hạn gói hiện có, xem trước kỳ gia hạn và tách pending payment khỏi quyền vào cửa active."
      title="Gia hạn gói"
    >
      <RenewPackageWizard />
    </StaffPageFrame>
  )
}
