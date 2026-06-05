import { cn } from "@/lib/utils"

export type Status =
  | "active"
  | "inactive"
  | "paid"
  | "pending"
  | "pending_payment"
  | "expired"
  | "failed"
  | "refunded"
  | "checked-in"
  | "assigned"
  | "locked"
  | "cancelled"
  | "unknown"

const statusStyles: Record<Status, string> = {
  active:
    "border-[color:var(--status-active-border)] bg-[var(--status-active-bg)] text-[var(--status-active-text)]",
  inactive:
    "border-[color:var(--status-muted-border)] bg-[var(--status-muted-bg)] text-[var(--status-muted-text)]",
  paid:
    "border-[color:var(--status-active-border)] bg-[var(--status-active-bg)] text-[var(--status-active-text)]",
  pending:
    "border-[color:var(--status-pending-border)] bg-[var(--status-pending-bg)] text-[var(--status-pending-text)]",
  pending_payment:
    "border-[color:var(--status-pending-border)] bg-[var(--status-pending-bg)] text-[var(--status-pending-text)]",
  expired:
    "border-[color:var(--status-muted-border)] bg-[var(--status-muted-bg)] text-[var(--status-muted-text)]",
  failed:
    "border-[color:var(--status-failed-border)] bg-[var(--status-failed-bg)] text-[var(--status-failed-text)]",
  refunded:
    "border-[color:var(--status-muted-border)] bg-[var(--status-muted-bg)] text-[var(--status-muted-text)]",
  "checked-in":
    "border-[color:var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
  assigned:
    "border-[color:var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
  locked:
    "border-[color:var(--status-failed-border)] bg-[var(--status-failed-bg)] text-[var(--status-failed-text)]",
  cancelled:
    "border-[color:var(--status-muted-border)] bg-[var(--status-muted-bg)] text-[var(--status-muted-text)]",
  unknown:
    "border-[color:var(--status-muted-border)] bg-[var(--status-muted-bg)] text-[var(--status-muted-text)]",
}

const statusLabels: Record<Status, string> = {
  active: "Hoạt động",
  inactive: "Tạm dừng",
  paid: "Đã thanh toán",
  pending: "Đang chờ",
  pending_payment: "Chờ thanh toán",
  expired: "Hết hạn",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
  "checked-in": "Đã check-in",
  assigned: "Đã phân công",
  locked: "Đã khóa",
  cancelled: "Đã hủy",
  unknown: "Không rõ",
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
