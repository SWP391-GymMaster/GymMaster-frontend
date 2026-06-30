"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  DollarSign,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react"

import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"
import { formatVnTime, vnDateIso, vnTodayIso } from "@/lib/date/vn-time"
import {
  useMemberships,
  usePackages,
  usePayments,
  useCheckInsByDate,
} from "@/features/billing/api/billing.queries"
import { useManagedMembers } from "@/features/member-management/api/member-management.queries"
import { cn } from "@/lib/utils"

const actions = [
  {
    href: staffRoutes.members,
    title: "Tìm hội viên",
    description: "Tra cứu hồ sơ, trạng thái gói và thao tác tiếp theo.",
    icon: Search,
  },
  {
    href: staffRoutes.sellPackage,
    title: "Bán gói tập",
    description: "Tạo giao dịch bán gói mới và ghi nhận thanh toán.",
    icon: CreditCard,
  },
  {
    href: staffRoutes.renewPackage,
    title: "Gia hạn gói",
    description: "Nối tiếp gói hiện có theo đúng ngày hết hạn.",
    icon: RefreshCw,
  },
  {
    href: staffRoutes.checkIn,
    title: "Check-in",
    description: "Xác minh điều kiện vào phòng trước khi xác nhận.",
    icon: ShieldCheck,
  },
]

function todayStr() {
  return vnTodayIso()
}

function daysUntil(dateStr: string) {
  const end = Date.parse(`${dateStr}T00:00:00Z`)
  const now = Date.parse(`${todayStr()}T00:00:00Z`)
  return Math.round((end - now) / 86_400_000)
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
}

function timeOf(iso: string) {
  return formatVnTime(iso, { hour: "2-digit", minute: "2-digit" }) || "--:--"
}

type Task = {
  key: string
  name: string
  code: string
  label: string
  meta: string
  priority: string
}

export function StaffDashboard() {
  const today = todayStr()
  const { data: memberships } = useMemberships()
  const { data: packages } = usePackages()
  const { data: membersResult } = useManagedMembers("")
  const { data: payments } = usePayments()
  const { data: checkIns } = useCheckInsByDate(today)

  const members = membersResult?.items ?? []

  const view = useMemo(() => {
    const memberOf = (id: number) => members.find((m) => m.id === id)
    const packageOf = (id: number) => packages?.find((p) => p.id === id)

    const ms = memberships ?? []
    const pending = ms.filter((m) => m.status === "pending_payment")
    const expiringSoon = ms.filter(
      (m) => m.status === "active" && daysUntil(m.endDate) >= 0 && daysUntil(m.endDate) <= 7,
    )

    const unpaidSum = pending.reduce((sum, m) => sum + (packageOf(m.packageId)?.price ?? 0), 0)

    // So sanh theo NGAY VN cua paidAt — nhat quan voi `today` o tren.
    const paidToday = (payments ?? []).filter(
      (p) => p.status === "paid" && vnDateIso(p.paymentDate ?? "") === today,
    )
    const revenueToday = paidToday.reduce((sum, p) => sum + (p.amount ?? 0), 0)

    // Hom nay can xu ly: don cho thanh toan truoc, roi goi sap het han.
    const tasks: Task[] = [
      ...pending.map((m): Task => {
        const member = memberOf(m.memberId)
        const pkg = packageOf(m.packageId)
        return {
          key: `pay-${m.id}`,
          name: member?.fullName ?? `Hội viên #${m.memberId}`,
          code: member?.memberCode ?? `HV-${m.memberId}`,
          label: "Chưa thanh toán",
          meta: formatPrice(pkg?.price ?? 0),
          priority: "Ưu tiên cao",
        }
      }),
      ...expiringSoon.map((m): Task => {
        const member = memberOf(m.memberId)
        const d = daysUntil(m.endDate)
        return {
          key: `exp-${m.id}`,
          name: member?.fullName ?? `Hội viên #${m.memberId}`,
          code: member?.memberCode ?? `HV-${m.memberId}`,
          label: "Sắp hết hạn",
          meta: d === 0 ? "Hết hạn hôm nay" : `Còn ${d} ngày`,
          priority: "Ưu tiên trung bình",
        }
      }),
    ].slice(0, 6)

    // Hoat dong gan day: thanh toan moi nhat.
    const activities = [...(payments ?? [])]
      .sort((a, b) => (b.paymentDate ?? "").localeCompare(a.paymentDate ?? ""))
      .slice(0, 5)
      .map((p) => ({
        key: `act-${p.id}`,
        time: timeOf(p.paymentDate),
        title: p.status === "paid" ? "Đã thu thanh toán" : "Đơn thanh toán",
        description: `${p.memberName ?? "Hội viên"} · ${p.packageName ?? ""} · ${formatPrice(p.amount ?? 0)}`,
      }))

    return {
      checkInsToday: checkIns?.length ?? 0,
      expiringCount: expiringSoon.length,
      pendingCount: pending.length,
      unpaidSum,
      soldToday: paidToday.length,
      revenueToday,
      tasks,
      activities,
    }
  }, [memberships, packages, members, payments, checkIns, today])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Chào buổi sáng, Staff
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            <span className={cn(view.tasks.length > 0 ? "text-destructive" : "text-foreground")}>

              {view.tasks.length > 0
                ? `Bạn có ${view.tasks.length} công việc cần xử lý hôm nay!`
                : "Hiện chưa có công việc nào cần xử lý."}{" "}
            </span>
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <FrontDeskMetric
              helper="Tổng lượt check-in trong ngày"
              icon={ShieldCheck}
              label="Check-in hôm nay"
              value={String(view.checkInsToday)}
            />
            <FrontDeskMetric
              helper="Trong 7 ngày tới"
              icon={CalendarClock}
              label="Gia hạn sắp đến"
              tone="warning"
              value={String(view.expiringCount)}
            />
            <FrontDeskMetric
              helper={`Tổng tiền ${formatPrice(view.unpaidSum)}`}
              icon={AlertTriangle}
              label="Đơn chưa thanh toán"
              tone="danger"
              value={String(view.pendingCount)}
            />
            <FrontDeskMetric
              helper={`Doanh thu ${formatPrice(view.revenueToday)}`}
              icon={DollarSign}
              label="Gói bán hôm nay"
              tone="info"
              value={String(view.soldToday)}
            />
          </div>
        </div>

        <aside className="gm-panel p-5">
          <p className="text-sm font-semibold text-foreground">Tổng quan hôm nay</p>
          <div className="mt-5 space-y-2 text-sm">
            <SummaryLine label="Check-in" value={String(view.checkInsToday)} />
            <SummaryLine label="Gói bán" value={String(view.soldToday)} />
            <SummaryLine label="Đơn chờ thu" value={String(view.pendingCount)} />
            <SummaryLine label="Gia hạn sắp đến" value={String(view.expiringCount)} />
          </div>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
            href={staffRoutes.payments}
          >
            Xem hàng đợi thanh toán →
          </Link>
        </aside>
      </section>

      <section className="gm-panel p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Thao tác nhanh
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Truy cập nhanh các chức năng front-desk thường dùng.
            </p>
          </div>
          <Link
            className="text-sm font-semibold text-primary hover:underline"
            href={staffRoutes.members}
          >
            Mở tìm kiếm
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                className="gm-interactive-card group p-5 text-center active:scale-[0.98]"
                href={action.href}
                key={action.href}
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <span className="mt-4 block font-semibold text-foreground">
                  {action.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                  {action.description}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="gm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Hôm nay cần xử lý
            </h3>
            <Link className="text-sm font-semibold text-primary hover:underline" href={staffRoutes.payments}>
              Xem hàng đợi →
            </Link>
          </div>

          {view.tasks.length === 0 ? (
            <p className="mt-5 py-8 text-center text-sm text-muted-foreground">
              Không có đơn chờ xử lý. 🎉
            </p>
          ) : (
            <div className="mt-5 divide-y divide-border">
              {view.tasks.map((task) => (
                <div className="flex flex-wrap items-center gap-4 py-4" key={task.key}>
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {task.name.split(" ").slice(-2).map((part) => part[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{task.name}</p>
                    <p className="text-sm text-muted-foreground">{task.code}</p>
                  </div>
                  <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                    {task.label}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">{task.meta}</span>
                  <span className="text-xs font-semibold text-orange-600">{task.priority}</span>
                  <Link
                    className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                    href={staffRoutes.payments}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="gm-panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Hoạt động gần đây
            </h3>
            <Link className="text-sm font-semibold text-primary hover:underline" href={staffRoutes.payments}>
              Xem tất cả
            </Link>
          </div>

          {view.activities.length === 0 ? (
            <p className="mt-5 py-8 text-center text-sm text-muted-foreground">
              Chưa có hoạt động thanh toán.
            </p>
          ) : (
            <div className="relative mt-5 space-y-5 before:absolute before:bottom-3 before:left-[4.25rem] before:top-3 before:w-px before:bg-border">
              {view.activities.map((activity) => (
                <div className="grid grid-cols-[56px_24px_minmax(0,1fr)] gap-3" key={activity.key}>
                  <span className="text-sm font-medium text-muted-foreground">{activity.time}</span>
                  <span className="relative z-10 mt-1 size-3 rounded-full bg-primary ring-4 ring-card" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}

function FrontDeskMetric({
  helper,
  icon: Icon,
  label,
  tone = "success",
  value,
}: {
  helper: string
  icon: typeof Search
  label: string
  tone?: "success" | "warning" | "danger" | "info"
  value: string
}) {
  const toneClass = {
    success: "bg-primary/10 text-primary",
    warning: "bg-orange-500/10 text-orange-600",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
  }[tone]

  return (
    <article className="gm-panel p-5">
      <span className={`flex size-11 items-center justify-center rounded-full ${toneClass}`}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium text-primary">{helper}</p>
    </article>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}
