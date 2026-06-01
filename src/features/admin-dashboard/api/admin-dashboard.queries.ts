"use client"

import { useQuery } from "@tanstack/react-query"

import { getDashboardSummary, getAuditLogs } from "@/features/admin-dashboard/api/admin-dashboard.api"
import type { AuditLogFilters } from "@/features/admin-dashboard/types/admin-dashboard.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const adminDashboardKeys = {
  all: ["admin-dashboard"] as const,
  summary: () => [...adminDashboardKeys.all, "summary"] as const,
  auditLogs: (filters: AuditLogFilters & { page?: number }) =>
    [...adminDashboardKeys.all, "audit-logs", filters] as const,
}

function useAdminAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useDashboardSummary() {
  const accessToken = useAdminAccessToken()

  return useQuery({
    queryKey: adminDashboardKeys.summary(),
    queryFn: () => getDashboardSummary(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}

export function useAuditLogs(
  filters: AuditLogFilters & { page?: number },
) {
  const accessToken = useAdminAccessToken()

  return useQuery({
    queryKey: adminDashboardKeys.auditLogs(filters),
    queryFn: () => getAuditLogs(accessToken ?? "", filters),
    enabled: Boolean(accessToken),
  })
}
