import type { UserRole } from "@/types/auth"

export const userRoles = ["admin", "staff", "pt", "member"] as const

export const dashboardByRole: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  pt: "/pt/dashboard",
  member: "/member/dashboard",
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && userRoles.includes(value as UserRole)
}

export function getDashboardRoute(role: UserRole): string {
  return dashboardByRole[role]
}

export function normalizeRoleRedirect(role: unknown): string | null {
  if (!isUserRole(role)) {
    return null
  }

  return getDashboardRoute(role)
}
