import { SellPackageWizard } from "@/features/staff-front-desk/components/SellPackageWizard"
import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffSellPackagePage() {
  return (
    <StaffPageFrame
      description="Chọn hội viên, chọn gói active, xác nhận bán gói và tách pending payment khỏi gói active."
      metrics={[
        { label: "Trạng thái bán", value: "Chờ thanh toán", tone: "dark" },
        { label: "Nguồn gói", value: "Mock API catalog" },
        { label: "Thanh toán", value: "Xác nhận thủ công" },
      ]}
      title="Bán gói tập"
    >
      <SellPackageWizard />
    </StaffPageFrame>
  )
}
