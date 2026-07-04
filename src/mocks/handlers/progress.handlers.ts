import { http } from "msw"

import {
  assignments,
  progressEntries,
} from "@/mocks/data/gymmaster.mock-data"
import { created, fail, ok, requireRole } from "@/mocks/utils/api-response"
import { vnTodayIso } from "@/lib/date/vn-time"

function isAssignedToPt(memberId: number) {
  return assignments.some(
    (assignment) =>
      assignment.memberId === memberId && assignment.status === "active",
  )
}

export const progressHandlers = [
  http.post("/api/v1/members/:id/progress", async ({ params, request }) => {
    const role = requireRole(request, ["member", "pt"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)
    const body = (await request.json()) as {
      measuredAt?: string
      weightKg?: number
      bodyFatPct?: number
    }

    if (role === "pt" && !isAssignedToPt(memberId)) {
      return fail("FORBIDDEN", "PT can only manage assigned members", 403)
    }

    const weightKg = body.weightKg ?? 0
    const today = vnTodayIso()

    if (
      weightKg <= 0 ||
      (body.bodyFatPct !== undefined && body.bodyFatPct <= 0) ||
      (body.measuredAt !== undefined &&
        body.measuredAt > today)
    ) {
      return fail("INVALID_MEASUREMENT", "Progress measurement is invalid", 422)
    }

    const entry = {
      id: Math.max(...progressEntries.map((item) => item.id)) + 1,
      memberId,
      measuredAt: body.measuredAt ?? today,
      weightKg,
      ...(body.bodyFatPct === undefined ? {} : { bodyFatPct: body.bodyFatPct }),
    }
    progressEntries.push(entry)

    return created(entry)
  }),
  http.get("/api/v1/members/:id/progress", ({ params, request }) => {
    const role = requireRole(request, ["member", "pt", "admin"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)

    if (role === "pt" && !isAssignedToPt(memberId)) {
      return fail("FORBIDDEN", "PT can only view assigned members", 403)
    }

    return ok(progressEntries.filter((item) => item.memberId === memberId))
  }),
]
