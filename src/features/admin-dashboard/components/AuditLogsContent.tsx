"use client"

import { useState } from "react"

import { AuditLogTable } from "@/features/admin-dashboard/components/AuditLogTable"
import { AuditLogFilters } from "@/features/admin-dashboard/components/AuditLogFilters"
import type { AuditLogFilterValues } from "@/features/admin-dashboard/components/AuditLogFilters"
import { useAuditLogs } from "@/features/admin-dashboard/api/admin-dashboard.queries"
import type { AuditLogFilters as AuditLogFilterParams } from "@/features/admin-dashboard/types/admin-dashboard.types"

export function AuditLogsContent() {
  const [page, setPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<AuditLogFilterValues>({
    action: "",
    from: "",
    to: "",
  })

  const queryFilters: AuditLogFilterParams & { page: number } = {
    page,
    ...(activeFilters.action ? { action: activeFilters.action } : {}),
    ...(activeFilters.from ? { from: activeFilters.from } : {}),
    ...(activeFilters.to ? { to: activeFilters.to } : {}),
  }

  const { data, isLoading, error, refetch } = useAuditLogs(queryFilters)

  function handleApplyFilters(values: AuditLogFilterValues) {
    setActiveFilters(values)
    setPage(1)
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Audit logs are unavailable."

    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-800">{message}</p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-700 active:scale-[0.97]"
          onClick={() => refetch()}
          type="button"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AuditLogFilters
        isLoading={isLoading}
        onApply={handleApplyFilters}
      />
      <AuditLogTable
        data={data?.items ?? []}
        isLoading={isLoading}
        onPageChange={setPage}
        page={page}
        pageSize={10}
        total={data?.total ?? 0}
      />
    </div>
  )
}
