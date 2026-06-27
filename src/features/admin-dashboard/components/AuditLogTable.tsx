"use client"

import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react"

import type { AuditLogEntry } from "@/features/admin-dashboard/types/admin-dashboard.types"
import { cn } from "@/lib/utils"
import { formatVnDate, formatVnTime } from "@/lib/date/vn-time"

type AuditLogTableProps = {
  data: AuditLogEntry[]
  isLoading?: boolean
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  selectedLogKey?: string | null
  onSelectLog?: (log: AuditLogEntry) => void
}

export function getAuditLogKey(log: AuditLogEntry) {
  return `${log.createdAt}-${log.action}-${log.entityType}-${log.entityId}`
}

export function AuditLogTable({
  data,
  isLoading,
  page,
  total,
  pageSize,
  onPageChange,
  selectedLogKey,
  onSelectLog,
}: AuditLogTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              className="grid gap-4 rounded-xl border border-border bg-background p-4 md:grid-cols-[80px_180px_1fr_120px_80px]"
              key={index}
            >
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
        <FileText aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Không có audit log phù hợp với bộ lọc.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thử đổi ngày, hành động hoặc đặt lại bộ lọc.
        </p>
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-[120px_minmax(180px,0.8fr)_minmax(240px,1.2fr)_120px_90px_32px] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <span>Thời gian</span>
        <span>Người thực hiện</span>
        <span>Thao tác</span>
        <span>Đối tượng</span>
        <span>Mức độ</span>
        <span />
      </div>

      <div className="divide-y divide-border">
        {data.map((log) => {
          const selected = selectedLogKey === getAuditLogKey(log)
          const ActionIcon = getActionIcon(log.action)
          const severity = getAuditSeverity(log.action)

          return (
            <button
              className={cn(
                "grid w-full grid-cols-[120px_minmax(180px,0.8fr)_minmax(240px,1.2fr)_120px_90px_32px] items-center gap-4 px-5 py-4 text-left transition hover:bg-muted/35",
                selected ? "bg-primary/5 shadow-[inset_3px_0_0_hsl(var(--primary))]" : "",
              )}
              key={getAuditLogKey(log)}
              onClick={() => onSelectLog?.(log)}
              type="button"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(log.createdAt)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTime(log.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {initials(log.userDisplayName ?? `User ${log.userId}`)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {log.userDisplayName ?? `User #${log.userId}`}
                  </p>
                  <p className="text-xs text-muted-foreground">ID #{log.userId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", getActionToneClass(log.action))}>
                  <ActionIcon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <ActionBadge action={log.action} />
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {getActionSubtitle(log.action)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium capitalize text-foreground">
                  {log.entityType}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  #{log.entityId}
                </p>
              </div>

              <SeverityBadge severity={severity} />

              <span className="text-lg text-muted-foreground">›</span>
            </button>
          )
        })}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages} · {total} bản ghi
          </p>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:bg-muted active:scale-[0.98] disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              Trước
            </button>
            <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background">
              {page}
            </span>
            <button
              className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:bg-muted active:scale-[0.98] disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              type="button"
            >
              Sau
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span className={cn("inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-semibold", getActionBadgeClass(action))}>
      <span className="truncate">{action.replace(/_/g, " ")}</span>
    </span>
  )
}

type AuditSeverity = "high" | "medium" | "low"

function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  const label = severity === "high" ? "Cao" : severity === "medium" ? "TB" : "Thấp"

  return (
    <span className={cn("inline-flex justify-center rounded-full px-2.5 py-1 text-xs font-semibold", getSeverityClass(severity))}>
      {label}
    </span>
  )
}

function getAuditSeverity(action: string): AuditSeverity {
  if (
    [
      "MEMBERSHIP_PAYMENT_CONFIRMED",
      "SELL_MEMBERSHIP",
      "MEMBERSHIP_RENEWAL",
      "LOCK_MEMBER_ACCOUNT",
      "CREATE_STAFF_ACCOUNT",
      "UPDATE_PACKAGE",
    ].includes(action)
  ) {
    return "high"
  }

  if (["ASSIGN_PT", "MEMBER_CHECK_IN"].includes(action)) {
    return "medium"
  }

  return "low"
}

function getSeverityClass(severity: AuditSeverity) {
  switch (severity) {
    case "high":
      return "bg-destructive/10 text-destructive"
    case "medium":
      return "bg-orange-500/10 text-orange-600"
    case "low":
      return "bg-primary/10 text-primary"
  }
}

function getActionIcon(action: string) {
  if (action.includes("PAYMENT") || action.includes("MEMBERSHIP")) return CheckCircle2
  if (action.includes("LOCK")) return LockKeyhole
  if (action.includes("STAFF") || action.includes("PT")) return Users
  if (action.includes("WORKOUT") || action.includes("NOTE")) return Activity
  if (action.includes("CHECK_IN")) return ShieldCheck
  return FileText
}

function getActionToneClass(action: string) {
  if (action.includes("PAYMENT") || action.includes("MEMBERSHIP")) return "bg-primary/10 text-primary"
  if (action.includes("LOCK")) return "bg-destructive/10 text-destructive"
  if (action.includes("STAFF") || action.includes("PT")) return "bg-violet-500/10 text-violet-600"
  if (action.includes("WORKOUT") || action.includes("NOTE")) return "bg-blue-500/10 text-blue-600"
  if (action.includes("CHECK_IN")) return "bg-emerald-500/10 text-emerald-600"
  return "bg-muted text-muted-foreground"
}

function getActionBadgeClass(action: string) {
  if (action.includes("PAYMENT") || action.includes("MEMBERSHIP")) return "bg-primary/10 text-primary"
  if (action.includes("LOCK")) return "bg-destructive/10 text-destructive"
  if (action.includes("STAFF") || action.includes("PT")) return "bg-violet-500/10 text-violet-600"
  if (action.includes("WORKOUT") || action.includes("NOTE")) return "bg-blue-500/10 text-blue-600"
  if (action.includes("CHECK_IN")) return "bg-emerald-500/10 text-emerald-600"
  return "bg-muted text-muted-foreground"
}

function getActionSubtitle(action: string) {
  switch (action) {
    case "MEMBERSHIP_PAYMENT_CONFIRMED":
      return "Xác nhận thanh toán gói tập"
    case "MEMBER_CHECK_IN":
      return "Hội viên check-in"
    case "SELL_MEMBERSHIP":
      return "Bán gói tập"
    case "MEMBERSHIP_RENEWAL":
      return "Gia hạn gói tập"
    case "ASSIGN_PT":
      return "Phân công PT"
    case "CREATE_WORKOUT_PLAN":
      return "Tạo giáo án tập luyện"
    case "ADD_TRAINER_NOTE":
      return "Thêm ghi chú PT"
    case "CREATE_STAFF_ACCOUNT":
      return "Tạo tài khoản nhân sự"
    case "LOCK_MEMBER_ACCOUNT":
      return "Khóa tài khoản hội viên"
    case "UPDATE_PACKAGE":
      return "Cập nhật gói tập"
    default:
      return "Thao tác hệ thống"
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatDate(value: string) {
  return formatVnDate(value)
}

function formatTime(value: string) {
  return formatVnTime(value, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}
