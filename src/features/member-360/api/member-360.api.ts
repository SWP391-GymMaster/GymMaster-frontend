import { apiRequest } from "@/lib/api/http-client"
import type { Member360Data } from "@/features/member-360/types/member-360.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

// Backend tra status enum PascalCase (PendingPayment/Active, Pending/Paid...) -> snake_case.
function normMembershipStatus(s?: string) {
  switch (s?.toLowerCase()) {
    case "pendingpayment":
    case "pending_payment":
    case "pending":
      return "pending_payment" as const
    case "active":
      return "active" as const
    case "expired":
      return "expired" as const
    case "cancelled":
    case "canceled":
      return "cancelled" as const
    default:
      return (s ?? "") as "active" | "pending_payment" | "expired" | "cancelled"
  }
}

function normPaymentStatus(s?: string) {
  switch (s?.toLowerCase()) {
    case "paid":
      return "paid" as const
    case "refunded":
      return "refunded" as const
    default:
      return "pending" as const
  }
}

export async function getMember360Data(
  accessToken: string,
  memberId: number,
): Promise<Member360Data> {
  const data = await apiRequest<Member360Data>(
    `/api/v1/members/${memberId}/profile-360`,
    {
      headers: authHeaders(accessToken),
    },
  )

  return {
    ...data,
    currentMembership: data.currentMembership
      ? {
          ...data.currentMembership,
          status: normMembershipStatus(data.currentMembership.status),
          paymentStatus: normPaymentStatus(data.currentMembership.paymentStatus),
        }
      : data.currentMembership,
  }
}
