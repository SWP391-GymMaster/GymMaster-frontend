import { http } from "msw"

import {
  auditLogs,
  members,
  memberships,
} from "@/mocks/data/gymmaster.mock-data"
import { getPage, ok, paged, requireRole } from "@/mocks/utils/api-response"

function generateCheckinsByDay() {
  const today = new Date("2026-06-01")
  const days: { date: string; count: number }[] = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    days.push({
      date: date.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 20) + 5,
    })
  }

  return days
}

export const dashboardAuditHandlers = [
  http.get("/api/dashboard/summary", ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const activeCount = memberships.filter(
      (item) => item.status === "Active",
    ).length
    const expiredCount = members.filter((item) => item.status === "expired").length

    return ok({
      revenue: 12600000,
      activeCount,
      expiredCount,
      checkinsByDay: generateCheckinsByDay(),
    })
  }),
  http.get("/api/audit-logs", ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const userIdParam = url.searchParams.get("userId")
    const actionParam = url.searchParams.get("action")
    const fromParam = url.searchParams.get("from")
    const toParam = url.searchParams.get("to")

    let filtered = [...auditLogs]

    if (userIdParam) {
      const uid = Number(userIdParam)
      if (Number.isFinite(uid)) {
        filtered = filtered.filter((item) => item.userId === uid)
      }
    }

    if (actionParam) {
      filtered = filtered.filter((item) => item.action === actionParam)
    }

    if (fromParam) {
      filtered = filtered.filter((item) => item.createdAt >= fromParam)
    }

    if (toParam) {
      filtered = filtered.filter((item) => item.createdAt <= toParam)
    }

    return paged(filtered, getPage(request.url))
  }),
]
