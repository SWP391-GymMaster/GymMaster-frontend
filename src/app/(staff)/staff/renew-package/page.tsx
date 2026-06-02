import { RenewPackageWizard } from "@/features/staff-front-desk/components/RenewPackageWizard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffRenewPackagePage() {
  return (
    <StaffPageFrame
      description="Gia hạn gói hiện có, xem trước kỳ gia hạn và tách pending payment khỏi quyền vào cửa active."
      metrics={[
        { label: "Gia hạn", value: "Xem trước kỳ mới", tone: "dark" },
        { label: "Rule gói tập", value: "Nối từ ngày hết hạn" },
        { label: "Thanh toán", value: "Xác nhận thủ công" },
      ]}
      title="Gia hạn gói"
    >
      <RenewPackageWizard />
    </StaffPageFrame>
  )
}
