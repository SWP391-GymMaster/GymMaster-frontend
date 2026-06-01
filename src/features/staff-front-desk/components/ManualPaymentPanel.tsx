"use client"

import { toast } from "sonner"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { useRecordStaffManualPayment } from "@/features/staff-front-desk/api/staff-front-desk.queries"
import type {
  ManualPaymentResult,
  MembershipSnapshot,
} from "@/features/staff-front-desk/types/staff-front-desk.types"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"

type ManualPaymentPanelProps = {
  membership: MembershipSnapshot
  onRecorded?: (result: ManualPaymentResult) => void
}

export function ManualPaymentPanel({
  membership,
  onRecorded,
}: ManualPaymentPanelProps) {
  const recordPayment = useRecordStaffManualPayment()
  const error = recordPayment.error
    ? mapStaffOperationError(recordPayment.error)
    : null

  async function onRecordPayment() {
    const result = await recordPayment.mutateAsync({
      membershipId: membership.id,
      amount: membership.price,
      paymentMethod: "cash",
      paidAt: new Date().toISOString(),
    })
    toast.success("Manual payment recorded")
    onRecorded?.(result)
  }

  return (
    <section className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-950">
            Payment required
          </p>
          <p className="mt-1 text-sm text-amber-900">
            Membership is pending until manual payment is recorded.
          </p>
        </div>
        <StatusPill status="pending" />
      </div>
      <Button
        className="mt-4 min-h-11 rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800"
        data-testid="staff-record-payment-button"
        disabled={recordPayment.isPending}
        onClick={onRecordPayment}
        type="button"
      >
        {recordPayment.isPending ? "Recording..." : "Record cash payment"}
      </Button>
      {error ? (
        <StateBlock
          className="mt-3"
          description="Confirm the membership and payment amount before recording again."
          title={error.message}
          tone="error"
        />
      ) : null}
    </section>
  )
}
