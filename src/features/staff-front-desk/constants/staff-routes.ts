export const staffRoutes = {
  dashboard: "/staff/dashboard",
  members: "/staff/members",
  memberDetail: (id: number | string) => `/staff/members/${id}`,
  sellPackage: "/staff/sell-package",
  renewPackage: "/staff/renew-package",
  checkIn: "/staff/check-in",
  payments: "/staff/payments",
} as const
