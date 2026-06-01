import { http } from "msw"

import {
  checkins,
  mealLogs,
  memberships,
  progressEntries,
  workoutPlans,
} from "@/mocks/data/gymmaster.mock-data"
import { created, ok, requireRole } from "@/mocks/utils/api-response"

export const progressHandlers = [
  http.post("/api/members/:id/progress", async ({ params, request }) => {
    const role = requireRole(request, ["member", "pt"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as {
      measuredAt?: string
      weightKg?: number
      bodyFatPct?: number
    }
    const entry = {
      id: Math.max(...progressEntries.map((item) => item.id)) + 1,
      memberId: Number(params.id),
      measuredAt: body.measuredAt ?? new Date().toISOString().slice(0, 10),
      weightKg: body.weightKg ?? 0,
      ...(body.bodyFatPct === undefined ? {} : { bodyFatPct: body.bodyFatPct }),
    }
    progressEntries.push(entry)

    return created(entry)
  }),
  http.get("/api/members/:id/progress", ({ params, request }) => {
    const role = requireRole(request, ["member", "pt", "admin"])
    if (typeof role !== "string") return role

    return ok(progressEntries.filter((item) => item.memberId === Number(params.id)))
  }),
  http.get("/api/members/:id/profile-360", ({ params, request }) => {
    const role = requireRole(request, ["member", "pt", "admin"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)

    return ok({
      memberId,
      membership: memberships.find((item) => item.memberId === memberId) ?? null,
      checkins: checkins.filter((item) => item.memberId === memberId),
      progress: progressEntries.filter((item) => item.memberId === memberId),
      workoutPlans: workoutPlans.filter((item) => item.memberId === memberId),
      mealLogs: mealLogs.filter((item) => item.memberId === memberId),
    })
  }),
]
