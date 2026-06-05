import { http } from "msw"

import {
  auditLogs,
  members,
  memberships,
} from "@/mocks/data/gymmaster.mock-data"
import { fail, getPage, ok, paged, requireRole } from "@/mocks/utils/api-response"

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
  http.get("/api/v1/dashboard/summary", ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const fromParam = url.searchParams.get("from")
    const toParam = url.searchParams.get("to")

    if (fromParam && toParam && fromParam > toParam) {
      return fail("INVALID_RANGE", "Date range is invalid", 422)
    }

    if (fromParam && fromParam > "2099-01-01") {
      return ok({
        revenue: 0,
        activeCount: 0,
        expiredCount: 0,
        checkinsByDay: [],
      })
    }

    const activeCount = memberships.filter(
      (item) => item.status === "active",
    ).length
    const expiredCount = members.filter((item) => item.status === "expired").length

    return ok({
      revenue: 12600000,
      activeCount,
      expiredCount,
      checkinsByDay: generateCheckinsByDay(),
    })
  }),
  http.get("/api/v1/audit-logs", ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const userIdParam = url.searchParams.get("userId")
    const actionParam = url.searchParams.get("action")
    const fromParam = url.searchParams.get("from")
    const toParam = url.searchParams.get("to")
    const searchParam = url.searchParams.get("search")?.toLowerCase()

    let filtered = [...auditLogs]

    if (fromParam && toParam && fromParam > toParam) {
      return fail("INVALID_RANGE", "Date range is invalid", 422)
    }

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

    if (searchParam) {
      filtered = filtered.filter((item) => {
        const actionFormatted = item.action.replace(/_/g, " ").toLowerCase()
        return (
          item.userDisplayName?.toLowerCase().includes(searchParam) ||
          item.action.toLowerCase().includes(searchParam) ||
          actionFormatted.includes(searchParam) ||
          item.entityType.toLowerCase().includes(searchParam) ||
          String(item.entityId).includes(searchParam) ||
          String(item.userId).includes(searchParam) ||
          String(item.id).includes(searchParam)
        )
      })
    }

    return paged(filtered, getPage(request.url))
  }),
]
