export type CheckInByDay = {
  date: string
  count: number
}

export type RevenueByMonth = {
  month: string
  revenue: number
}

export type ExpiredMembershipItem = {
  initials: string
  memberName: string
  packageName: string
  expiredDate: string
}

// Phản chiếu DashboardSummaryResponse của backend (DashboardService.GetSummaryAsync).
export type DashboardSummary = {
  revenue: number
  activeCount: number
  expiredCount: number
  checkinsByDay: CheckInByDay[]
  pendingPaymentAmount: number
  pendingPaymentCount: number
  revenueByMonth: RevenueByMonth[]
  recentlyExpired: ExpiredMembershipItem[]
  facilityLoadPercent: number
  ptSessionPercent: number
  generalAreaPercent: number
  previousMonthRevenue: number
  newMembershipsThisMonth: number
  peakHourStart: number
  peakHourEnd: number
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

