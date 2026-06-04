import type { UserRole } from "@/types/auth"
import { cn } from "@/lib/utils"

const roleLabels: Record<UserRole, string> = {
  admin: "Quản trị viên",
  staff: "Nhân viên lễ tân",
  pt: "Huấn luyện viên PT",
  member: "Hội viên",
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  staff: "bg-sky-500/10 text-sky-500 border-sky-500/20 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30",
  pt: "bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  member: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
}

type RoleBadgeProps = {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span className={cn(
      "inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold tracking-wide uppercase",
      roleColors[role]
    )}>
      {roleLabels[role]}
    </span>
  )
}
