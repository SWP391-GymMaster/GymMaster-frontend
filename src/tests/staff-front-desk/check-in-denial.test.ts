import { describe, expect, it } from "vitest"

import { ApiClientError } from "@/lib/api/http-client"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"

describe("mapStaffOperationError", () => {
  it("maps no-active-membership errors to a Staff-safe denial message", () => {
    const error = new ApiClientError({
      code: "NO_ACTIVE_MEMBERSHIP",
      message: "Member does not have an active membership",
    })

    expect(mapStaffOperationError(error)).toEqual({
      code: "NO_ACTIVE_MEMBERSHIP",
      message:
        "Check-in bị từ chối vì hội viên chưa có gói đang hoạt động.",
    })
  })

  it("maps pending-payment errors to a clear Staff-safe denial message", () => {
    const error = new ApiClientError({
      code: "PAYMENT_PENDING",
      message: "Membership payment is still pending",
    })

    expect(mapStaffOperationError(error)).toEqual({
      code: "PAYMENT_PENDING",
      message: "Check-in bị từ chối vì gói hội viên đang chờ thanh toán.",
    })
  })
})
