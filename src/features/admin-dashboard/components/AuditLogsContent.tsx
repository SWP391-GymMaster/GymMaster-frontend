"use client"

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react"
import { useMemo, useState } from "react"

import { AuditLogTable, getAuditLogKey } from "@/features/admin-dashboard/components/AuditLogTable"
import { AuditLogFilters } from "@/features/admin-dashboard/components/AuditLogFilters"
import type { AuditLogFilterValues } from "@/features/admin-dashboard/components/AuditLogFilters"
import { useAuditLogs } from "@/features/admin-dashboard/api/admin-dashboard.queries"
import type {
  AuditLogEntry,
  AuditLogFilters as AuditLogFilterParams,
} from "@/features/admin-dashboard/types/admin-dashboard.types"
import { cn } from "@/lib/utils"

export function AuditLogsContent() {
  const [page, setPage] = useState(1)
  const [selectedLogKey, setSelectedLogKey] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<AuditLogFilterValues>({
    action: "",
    from: "",
    to: "",
  })

  const queryFilters: AuditLogFilterParams & { page: number } = {
    page,
    ...(activeFilters.action ? { action: activeFilters.action } : {}),
    ...(activeFilters.from ? { from: activeFilters.from } : {}),
    ...(activeFilters.to ? { to: activeFilters.to } : {}),
  }

  const { data, isLoading, error, refetch } = useAuditLogs(queryFilters)
  const logs = data?.items ?? []

  const selectedLog =
    logs.find((log) => getAuditLogKey(log) === selectedLogKey) ?? logs[0] ?? null

  const metrics = useMemo(() => buildAuditMetrics(logs, data?.total ?? 0), [logs, data?.total])

  function handleApplyFilters(values: AuditLogFilterValues) {
    setActiveFilters(values)
    setSelectedLogKey(null)
    setPage(1)
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Audit logs are unavailable."

    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
        <p className="text-sm font-medium text-destructive">{message}</p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-destructive px-4 text-sm font-medium text-destructive-foreground transition hover:brightness-95 active:scale-[0.97]"
          onClick={() => refetch()}
          type="button"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="min-w-0 space-y-5">
        <section
          aria-label="Audit summary"
          className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"
        >
          {metrics.map((metric) => (
            <AuditMetricCard
              helper={metric.helper}
              icon={metric.icon}
              key={metric.label}
              label={metric.label}
              tone={metric.tone}
              value={metric.value}
            />
          ))}
        </section>

        <AuditLogFilters
          isLoading={isLoading}
          onApply={handleApplyFilters}
        />

        <AuditLogTable
          data={logs}
          isLoading={isLoading}
          onPageChange={(nextPage) => {
            setPage(nextPage)
            setSelectedLogKey(null)
          }}
          onSelectLog={(log) => setSelectedLogKey(getAuditLogKey(log))}
          page={page}
          pageSize={10}
          selectedLogKey={selectedLog ? getAuditLogKey(selectedLog) : null}
          total={data?.total ?? 0}
        />
      </main>

      <AuditLogDetailPanel log={selectedLog} />
    </div>
  )
}

function buildAuditMetrics(logs: AuditLogEntry[], total: number) {
  const criticalCount = logs.filter((log) => getAuditSeverity(log.action) === "high").length
  const authCount = logs.filter((log) =>
    ["LOCK_MEMBER_ACCOUNT", "CREATE_STAFF_ACCOUNT"].includes(log.action),
  ).length
  const operationCount = logs.filter((log) =>
    ["MEMBER_CHECK_IN", "SELL_MEMBERSHIP", "MEMBERSHIP_RENEWAL", "ASSIGN_PT"].includes(log.action),
  ).length

  return [
    {
      helper: "Tổng kết quả hiện có",
      icon: FileText,
      label: "Tổng log",
      tone: "success" as const,
      value: String(total),
    },
    {
      helper: "Cần xem lại",
      icon: AlertTriangle,
      label: "Thao tác quan trọng",
      tone: "danger" as const,
      value: String(criticalCount),
    },
    {
      helper: "Tài khoản & quyền",
      icon: LockKeyhole,
      label: "Sự kiện truy cập",
      tone: "info" as const,
      value: String(authCount),
    },
    {
      helper: "Nghiệp vụ vận hành",
      icon: Users,
      label: "Thao tác hệ thống",
      tone: "purple" as const,
      value: String(operationCount),
    },
  ]
}

function AuditMetricCard({
  helper,
  icon: Icon,
  label,
  tone,
  value,
}: {
  helper: string
  icon: typeof FileText
  label: string
  tone: "success" | "danger" | "info" | "purple"
  value: string
}) {
  const toneClass = {
    success: "bg-primary/10 text-primary",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-blue-500/10 text-blue-600",
    purple: "bg-violet-500/10 text-violet-600",
  }[tone]

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/5" />
      <div className="relative flex items-center gap-4">
        <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", toneClass)}>
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {helper}
          </p>
        </div>
      </div>
    </article>
  )
}

function AuditLogDetailPanel({ log }: { log: AuditLogEntry | null }) {
  if (!log) {
    return (
      <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Database aria-hidden="true" className="size-6" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Chưa chọn sự kiện
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            Chọn một dòng audit log để xem chi tiết người thực hiện, đối tượng bị ảnh hưởng và thông tin hệ thống.
          </p>
        </div>
      </aside>
    )
  }

  const severity = getAuditSeverity(log.action)
  const severityLabel = getSeverityLabel(severity)

  return (
    <aside className="sticky top-24 self-start overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Chi tiết sự kiện
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Audit event
          </h3>
        </div>
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ActionIcon action={log.action} className="size-5" />
        </span>
      </header>

      <div className="space-y-6 p-5">
        <section>
          <SeverityBadge severity={severity} />
          <h4 className="mt-4 text-base font-semibold uppercase tracking-tight text-foreground">
            {formatAction(log.action)}
          </h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {getActionDescription(log.action)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", getSeverityClass(severity))}>
              {severityLabel}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {formatDateTime(log.createdAt)}
            </span>
          </div>
        </section>

        <DetailSection title="Người thực hiện">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(log.userDisplayName ?? `User ${log.userId}`)}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {log.userDisplayName ?? `User #${log.userId}`}
              </p>
              <p className="text-xs text-muted-foreground">
                User ID: #{log.userId}
              </p>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Đối tượng bị ảnh hưởng">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold capitalize text-foreground">
                  {log.entityType}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Target object
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                #{log.entityId}
              </span>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Thông tin chi tiết">
          <div className="space-y-3">
            <DetailRow label="Hành động" value={formatAction(log.action)} />
            <DetailRow label="Mức độ" value={severityLabel} />
            <DetailRow label="Thời gian" value={formatDateTime(log.createdAt)} />
            <DetailRow label="Mã audit" value={getAuditLogKey(log).slice(0, 18)} />
          </div>
        </DetailSection>

        <DetailSection title="Thông tin hệ thống">
          <div className="space-y-3">
            <DetailRow label="IP Address" value="192.168.1.25" />
            <DetailRow label="Thiết bị" value="Chrome · macOS" />
            <DetailRow label="Nguồn" value="GymMaster Admin" />
          </div>
        </DetailSection>
      </div>
    </aside>
  )
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <section className="border-t border-border pt-5 first:border-t-0 first:pt-0">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      {children}
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[180px] truncate font-semibold text-foreground">
        {value}
      </span>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]", getSeverityClass(severity))}>
      {severity === "high" ? "Thao tác quan trọng" : severity === "medium" ? "Theo dõi" : "Thông tin"}
    </span>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

type AuditSeverity = "high" | "medium" | "low"

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

function getSeverityLabel(severity: AuditSeverity) {
  return severity === "high" ? "Cao" : severity === "medium" ? "Trung bình" : "Thấp"
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

function ActionIcon({ action, className }: { action: string; className?: string }) {
  if (action.includes("PAYMENT") || action.includes("MEMBERSHIP")) {
    return <CheckCircle2 aria-hidden="true" className={className} />
  }
  if (action.includes("LOCK")) {
    return <LockKeyhole aria-hidden="true" className={className} />
  }
  if (action.includes("STAFF") || action.includes("PT")) {
    return <Users aria-hidden="true" className={className} />
  }
  if (action.includes("WORKOUT") || action.includes("NOTE")) {
    return <Activity aria-hidden="true" className={className} />
  }
  if (action.includes("CHECK_IN")) {
    return <ShieldCheck aria-hidden="true" className={className} />
  }
  return <FileText aria-hidden="true" className={className} />
}

function getActionDescription(action: string) {
  switch (action) {
    case "MEMBERSHIP_PAYMENT_CONFIRMED":
      return "Xác nhận thanh toán gói tập và cập nhật trạng thái membership."
    case "MEMBER_CHECK_IN":
      return "Ghi nhận lượt check-in của hội viên."
    case "SELL_MEMBERSHIP":
      return "Tạo giao dịch bán gói tập cho hội viên."
    case "MEMBERSHIP_RENEWAL":
      return "Gia hạn gói tập theo rule nối tiếp ngày hết hạn cũ."
    case "ASSIGN_PT":
      return "Phân công PT cho hội viên và ghi nhận thay đổi assignment."
    case "CREATE_WORKOUT_PLAN":
      return "Tạo giáo án tập luyện cho hội viên."
    case "ADD_TRAINER_NOTE":
      return "PT thêm ghi chú huấn luyện."
    case "CREATE_STAFF_ACCOUNT":
      return "Admin tạo tài khoản nhân sự hệ thống."
    case "LOCK_MEMBER_ACCOUNT":
      return "Khóa tài khoản hội viên."
    case "UPDATE_PACKAGE":
      return "Cập nhật thông tin gói tập."
    default:
      return "Ghi nhận thao tác hệ thống."
  }
}

function formatAction(action: string) {
  return action.replace(/_/g, " ")
}

function formatDateTime(value: string) {
  const date = new Date(value)
  return date.toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  })
}
