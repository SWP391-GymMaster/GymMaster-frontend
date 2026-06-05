import { apiRequest } from "@/lib/api/http-client"
import type {
  DashboardSummary,
  DashboardSummaryQuery,
} from "@/features/admin-dashboard/types/admin-dashboard.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export function getDashboardSummary(
  accessToken: string,
  query: DashboardSummaryQuery = {},
): Promise<DashboardSummary> {
  const params = new URLSearchParams()

  if (query.from) params.set("from", query.from)
  if (query.to) params.set("to", query.to)

  const qs = params.toString()

  return apiRequest<DashboardSummary>(
    `/api/v1/dashboard/summary${qs ? `?${qs}` : ""}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

import type { PagedResult } from "@/mocks/utils/api-response"
import type {
  AuditLogEntry,
  AuditLogFilters,
} from "@/features/admin-dashboard/types/admin-dashboard.types"

export function getAuditLogs(
  accessToken: string,
  filters: AuditLogFilters & { page?: number },
): Promise<PagedResult<AuditLogEntry>> {
  const params = new URLSearchParams()

  if (filters.page) params.set("page", String(filters.page))
  if (filters.userId) params.set("userId", String(filters.userId))
  if (filters.action) params.set("action", filters.action)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (filters.search) params.set("search", filters.search)

  const qs = params.toString()

  return apiRequest<PagedResult<AuditLogEntry>>(
    `/api/v1/audit-logs${qs ? `?${qs}` : ""}`,
    { headers: authHeaders(accessToken) },
  )
}
