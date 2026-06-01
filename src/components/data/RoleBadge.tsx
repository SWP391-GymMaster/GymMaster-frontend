import type { UserRole } from "@/types/auth"

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  staff: "Staff",
  pt: "PT",
  member: "Member",
}

type RoleBadgeProps = {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 text-sm font-medium text-emerald-950">
      {roleLabels[role]}
    </span>
  )
}
