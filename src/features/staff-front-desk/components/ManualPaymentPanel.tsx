"use client"

import { toast } from "sonner"

import { StateBlock } from "@/components/feedback/StateBlock"
import { useRecordStaffManualPayment } from "@/features/staff-front-desk/api/staff-front-desk.queries"
import { PaymentRequiredBanner } from "@/features/staff-front-desk/components/StaffTemplateParts"
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
    <PaymentRequiredBanner
      error={
        error ? (
        <StateBlock
          description="Confirm the membership and payment amount before recording again."
          title={error.message}
          tone="error"
        />
        ) : null
      }
      isPending={recordPayment.isPending}
      onRecordPayment={onRecordPayment}
    />
  )
}
