export const adminRoutes = {
  dashboard: "/admin/dashboard",
  users: "/admin/users",
  staff: "/admin/staff",
  members: "/admin/members",
  memberDetail: (id: number | string) => `/admin/members/${id}`,
  trainers: "/admin/trainers",
  packages: "/admin/packages",
  assignments: "/admin/assignments",
  auditLogs: "/admin/audit-logs",
} as const

export const adminNavItems = [
  { href: adminRoutes.dashboard, label: "Dashboard" },
  { href: adminRoutes.users, label: "Users" },
  { href: adminRoutes.staff, label: "Staff" },
  { href: adminRoutes.members, label: "Members" },
  { href: adminRoutes.trainers, label: "PTs" },
  { href: adminRoutes.packages, label: "Packages" },
  { href: adminRoutes.assignments, label: "Assignments" },
  { href: adminRoutes.auditLogs, label: "Audit Logs" },
] as const
