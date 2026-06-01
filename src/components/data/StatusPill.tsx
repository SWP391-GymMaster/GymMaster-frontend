import { cn } from "@/lib/utils"

export type Status =
  | "active"
  | "paid"
  | "pending"
  | "expired"
  | "failed"
  | "checked-in"
  | "assigned"
  | "locked"
  | "cancelled"
  | "unknown"

const statusStyles: Record<Status, string> = {
  active: "border-emerald-500/25 bg-emerald-500/10 text-emerald-900",
  paid: "border-emerald-500/25 bg-emerald-500/10 text-emerald-900",
  pending: "border-amber-500/25 bg-amber-500/10 text-amber-900",
  expired: "border-zinc-400/30 bg-zinc-200/70 text-zinc-800",
  failed: "border-red-500/25 bg-red-500/10 text-red-900",
  "checked-in": "border-sky-500/25 bg-sky-500/10 text-sky-900",
  assigned: "border-indigo-500/25 bg-indigo-500/10 text-indigo-900",
  locked: "border-red-500/25 bg-red-500/10 text-red-900",
  cancelled: "border-zinc-500/25 bg-zinc-300/60 text-zinc-800",
  unknown: "border-zinc-300 bg-zinc-100 text-zinc-700",
}

const statusLabels: Record<Status, string> = {
  active: "Active",
  paid: "Paid",
  pending: "Pending",
  expired: "Expired",
  failed: "Failed",
  "checked-in": "Checked in",
  assigned: "Assigned",
  locked: "Locked",
  cancelled: "Cancelled",
  unknown: "Unknown",
}

type StatusPillProps = {
  status: Status
  label?: string
  className?: string
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border px-3 text-sm font-medium",
        statusStyles[status],
        className,
      )}
    >
      {label ?? statusLabels[status]}
    </span>
  )
}
