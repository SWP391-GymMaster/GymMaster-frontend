import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"

export default function StaffPaymentsPage() {
  return (
    <StaffPageFrame
      description="Manual payment follow-up is currently handled inside package sale results for demo stability."
      metrics={[
        { label: "Payment workspace", value: "UI prepared", tone: "dark" },
        { label: "Current action", value: "Record after sale/renewal" },
        { label: "Queue status", value: "Candidate follow-up" },
      ]}
      title="Payments"
    >
      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
          Payment workspace
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
          Manual payment actions are available after a package sale.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
          A dedicated payment queue can be added after the Staff front desk MVP
          flow is validated.
        </p>
      </section>
    </StaffPageFrame>
  )
}
