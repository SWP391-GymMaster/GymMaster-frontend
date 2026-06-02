import type { UserRole } from "@/types/auth"

const roleLabels: Record<UserRole, string> = {
  admin: "Quản trị",
  staff: "Lễ tân",
  pt: "PT",
  member: "Hội viên",
}

type RoleBadgeProps = {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-full border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground">
      {roleLabels[role]}
    </span>
  )
}
