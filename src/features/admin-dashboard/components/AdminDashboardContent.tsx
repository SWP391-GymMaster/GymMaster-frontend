"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  DollarSign,
  Download,
  MoreVertical,
  UserCog,
  UserPlus,
  Users,
  UserCheck,
} from "lucide-react"
import Link from "next/link"

import { DashboardMetricCard } from "@/features/admin-dashboard/components/DashboardMetricCard"
import { useDashboardSummary } from "@/features/admin-dashboard/api/admin-dashboard.queries"
import { adminRoutes } from "@/features/admin-dashboard/constants/admin-routes"

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCompactVnd(amount: number) {
  if (amount >= 1_000_000_000) {
    return `${Math.round(amount / 1_000_000_000)} tỷ`
  }

  if (amount >= 1_000_000) {
    return `${Math.round(amount / 1_000_000)} triệu`
  }

  return formatVnd(amount)
}

type DashboardOptionalFields = {
  pendingPaymentAmount?: number
  pendingPaymentCount?: number
}

const monthlyRevenueRatio = [0.48, 0.54, 0.64, 0.7, 1]

const expiredMembers = [
  {
    id: "JD",
    name: "John Doe",
    plan: "Pro Annual",
    expiredOn: "2 ngày trước",
  },
  {
    id: "AS",
    name: "Alice Smith",
    plan: "Monthly Basic",
    expiredOn: "Hôm nay",
  },
]

export function AdminDashboardContent() {
  const summary = useDashboardSummary()

  if (summary.isLoading) {
    return (
      <div className="grid gap-5 xl:grid-cols-4">
        <DashboardMetricCard isLoading label="Doanh thu tháng" value="" />
        <DashboardMetricCard isLoading label="Hội viên active" value="" />
        <DashboardMetricCard isLoading label="Check-in hôm nay" value="" />
        <DashboardMetricCard isLoading label="Thanh toán chờ xử lý" value="" />
      </div>
    )
  }

  if (summary.error) {
    const message =
      summary.error instanceof Error
        ? summary.error.message
        : "Không thể tải dữ liệu dashboard."

    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
        <p className="text-sm font-medium text-destructive">{message}</p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-destructive px-4 text-sm font-medium text-destructive-foreground transition hover:brightness-95 active:scale-[0.97]"
          onClick={() => summary.refetch()}
          type="button"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const data = summary.data
  const optionalData = data as DashboardOptionalFields | undefined
  const revenue = data?.revenue ?? 0
  const todayCheckIns =
    data?.checkinsByDay?.reduce((sum, d) => sum + d.count, 0) ?? 0
  const pendingPaymentAmount = optionalData?.pendingPaymentAmount ?? 3_150_000
  const pendingPaymentCount = optionalData?.pendingPaymentCount ?? 14

  const chartData = monthlyRevenueRatio.map((ratio, index) => ({
    month: ["T1", "T2", "T3", "T4", "T5"][index],
    "Doanh thu": Math.round(revenue * ratio),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/60 active:scale-[0.98]"
          type="button"
        >
          <Download aria-hidden="true" className="size-4" />
          Xuất báo cáo
        </button>
        <button
          className="inline-flex min-h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/60 active:scale-[0.98]"
          type="button"
        >
          30 ngày gần nhất
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-4" aria-label="Chỉ số quản trị">
        <DashboardMetricCard
          className="min-h-[190px] rounded-2xl border-border bg-card shadow-sm"
          icon={DollarSign}
          label="DOANH THU THÁNG"
          trend={{ direction: "up", label: "+12.5% so với kỳ trước" }}
          value={formatCompactVnd(revenue)}
        />
        <DashboardMetricCard
          className="min-h-[190px] rounded-2xl border-border bg-card shadow-sm"
          icon={Users}
          label="HỘI VIÊN HOẠT ĐỘNG"
          trend={{ direction: "up", label: "+4.2% duy trì" }}
          value={data?.activeCount ?? 0}
        />
        <DashboardMetricCard
          className="min-h-[190px] rounded-2xl border-border bg-card shadow-sm"
          icon={UserCheck}
          label="CHECK-IN HÔM NAY"
          trend={{ direction: "neutral", label: "Cao điểm 17:00 - 19:00" }}
          value={todayCheckIns}
        />
        <DashboardMetricCard
          className="min-h-[190px] rounded-2xl border-l-4 border-border border-l-amber-500 bg-card shadow-sm"
          icon={AlertTriangle}
          iconColor="warning"
          label="THANH TOÁN CHỜ XỬ LÝ"
          trend={{ direction: "neutral", label: `${pendingPaymentCount} hóa đơn cần xử lý` }}
          value={formatVnd(pendingPaymentAmount)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                Tăng trưởng doanh thu
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tổng doanh thu theo tháng trong kỳ gần nhất.
              </p>
            </div>
            <button
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              type="button"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
              <span className="sr-only">Tùy chọn biểu đồ</span>
            </button>
          </div>

          <div className="mt-8 h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={chartData} margin={{ left: -10, right: 12 }}>
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000)}tr`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.875rem",
                      boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
                    }}
                    formatter={(value) => formatVnd(Number(value))}
                    labelFormatter={(label) => `Tháng ${String(label).replace("T", "")}`}
                  />
                  <Bar
                    dataKey="Doanh thu"
                    fill="hsl(var(--primary))"
                    maxBarSize={52}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                Chưa có dữ liệu doanh thu trong kỳ này.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Tải vận hành cơ sở
          </p>

          <div className="mt-9 flex justify-center">
            <div
              className="relative flex size-48 items-center justify-center rounded-full"
              style={{
                background:
                  "conic-gradient(hsl(var(--primary)) 0deg 281deg, hsl(var(--muted)) 281deg 360deg)",
              }}
            >
              <div className="flex size-36 flex-col items-center justify-center rounded-full bg-card shadow-inner">
                <p className="text-4xl font-semibold tracking-tight text-foreground">
                  78%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">giờ cao điểm</p>
              </div>
            </div>
          </div>

          <div className="mt-9 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-3 rounded-sm bg-primary" />
                Buổi PT
              </span>
              <span className="font-semibold text-foreground">45%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-3 rounded-sm bg-muted ring-1 ring-border" />
                Khu vực tập chung
              </span>
              <span className="font-semibold text-foreground">33%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Thao tác nhanh
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { href: adminRoutes.members, label: "Hội viên mới", icon: UserPlus },
              { href: adminRoutes.staff, label: "Thêm nhân sự", icon: UserCog },
            ].map((action) => {
              const Icon = action.icon

              return (
                <Link
                  className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-center text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md active:scale-[0.98]"
                  href={action.href}
                  key={action.href}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {action.label}
                </Link>
              )
            })}

            <Link
              className="col-span-2 flex min-h-20 items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md active:scale-[0.98]"
              href={adminRoutes.auditLogs}
            >
              <ClipboardCheck aria-hidden="true" className="size-5" />
              Chạy kiểm tra hệ thống
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
              Cần xử lý: gói đã hết hạn
            </p>
            <Link
              className="text-sm font-medium text-primary hover:underline"
              href={adminRoutes.members}
            >
              Xem tất cả
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[1.3fr_1fr_1fr_auto] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <span>Hội viên</span>
              <span>Gói tập</span>
              <span>Hết hạn</span>
              <span className="text-right">Thao tác</span>
            </div>

            {expiredMembers.map((member) => (
              <div
                className="grid grid-cols-[1.3fr_1fr_1fr_auto] items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
                key={member.id}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {member.id}
                  </span>
                  <span className="font-medium text-foreground">{member.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{member.plan}</span>
                <span className="text-sm font-medium text-destructive">
                  {member.expiredOn}
                </span>
                <Link
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-primary/40 px-4 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
                  href={adminRoutes.members}
                >
                  Gia hạn
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
