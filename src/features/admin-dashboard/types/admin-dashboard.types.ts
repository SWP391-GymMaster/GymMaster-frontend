export type CheckInByDay = {
  date: string
  count: number
}

export type DashboardSummary = {
  revenue: number
  activeCount: number
  expiredCount: number
  checkinsByDay: CheckInByDay[]
}

export type DashboardSummaryQuery = {
  from?: string
  to?: string
}

export type AuditLogEntry = {
  id: number
  userId: number
  userDisplayName?: string
  action: string
  createdAt: string
  entityType: string
  entityId: number
}

export type AuditLogFilters = {
  userId?: number
  action?: string
  from?: string
  to?: string
  search?: string
}

