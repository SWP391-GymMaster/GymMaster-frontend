import { describe, expect, it } from "vitest"

import { ApiClientError } from "@/lib/api/http-client"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"

describe("mapStaffOperationError", () => {
  it("maps inactive membership errors to a Staff-safe denial message", () => {
    const error = new ApiClientError({
      code: "MEMBERSHIP_INACTIVE",
      message: "Membership is not active",
    })

    expect(mapStaffOperationError(error)).toEqual({
      code: "MEMBERSHIP_INACTIVE",
      message:
        "Check-in bị từ chối vì hội viên chưa có gói đang hoạt động.",
    })
  })
})
