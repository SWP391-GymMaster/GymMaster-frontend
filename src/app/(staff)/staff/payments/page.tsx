import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffPaymentsPage() {
  return (
    <StaffPageFrame
      description="Theo dõi thanh toán thủ công hiện được xử lý trong kết quả bán/gia hạn gói để demo ổn định."
      metrics={[
        { label: "Workspace thanh toán", value: "UI prepared", tone: "dark" },
        { label: "Thao tác hiện tại", value: "Ghi sau bán/gia hạn" },
        { label: "Queue", value: "Follow-up" },
      ]}
      title="Thanh toán"
    >
      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Workspace thanh toán
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
          Thao tác thanh toán thủ công có sẵn sau khi bán hoặc gia hạn gói.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
          Hàng đợi thanh toán riêng có thể bổ sung sau khi luồng lễ tân MVP được xác nhận ổn định.
        </p>
      </section>
    </StaffPageFrame>
  )
}
