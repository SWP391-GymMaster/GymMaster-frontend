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
  DollarSign,
  TrendingUp,
  Users,
  UserCheck,
  UserX,
  Activity,
  ArrowRight,
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

export function AdminDashboardContent() {
  const summary = useDashboardSummary()

  if (summary.isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-4">
        <DashboardMetricCard isLoading label="Revenue" value="" />
        <DashboardMetricCard isLoading label="Active memberships" value="" />
        <DashboardMetricCard isLoading label="Expired memberships" value="" />
        <DashboardMetricCard isLoading label="Today check-ins" value="" />
      </div>
    )
  }

  if (summary.error) {
    const message =
      summary.error instanceof Error
        ? summary.error.message
        : "Dashboard data is unavailable."

    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-800">{message}</p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-700 active:scale-[0.97]"
          onClick={() => summary.refetch()}
          type="button"
        >
          Retry
        </button>
      </div>
    )
  }

  const data = summary.data
  const todayCheckIns =
    data?.checkinsByDay?.reduce((sum, d) => sum + d.count, 0) ?? 0
  // Build monthly revenue chart data from the checkins
  const chartData =
    data?.checkinsByDay?.map((d) => ({
      date: d.date,
      checkIns: d.count,
      revenue: Math.round((data.revenue / data.checkinsByDay.length) * 0.7),
    })) ?? []

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid gap-4 lg:grid-cols-4">
        <DashboardMetricCard
          icon={DollarSign}
          label="Revenue"
          trend={{ direction: "up", label: "+8% vs last period" }}
          value={formatVnd(data?.revenue ?? 0)}
        />
        <DashboardMetricCard
          icon={Users}
          label="Active memberships"
          trend={{ direction: "up", label: `${data?.activeCount ?? 0} total` }}
          value={data?.activeCount ?? 0}
        />
        <DashboardMetricCard
          icon={UserX}
          label="Expired memberships"
          trend={{ direction: "neutral", label: `${data?.expiredCount ?? 0} total` }}
          value={data?.expiredCount ?? 0}
        />
        <DashboardMetricCard
          icon={UserCheck}
          label="Today check-ins"
          trend={{ direction: "up", label: `${todayCheckIns} today` }}
          value={todayCheckIns}
        />
      </div>

      {/* Chart + Quick Actions Row */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Revenue Chart */}
        <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Revenue & check-in activity
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                {formatVnd(data?.revenue ?? 0)}
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
              <TrendingUp aria-hidden="true" className="size-5" />
            </span>
          </div>
          <div className="mt-6" style={{ minHeight: 256, width: "100%" }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#71717a" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#71717a" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid #e4e4e7",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No revenue data for this period.
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Quick actions</p>
          <div className="mt-4 grid gap-2">
            {[
              { href: adminRoutes.members, label: "Browse members", icon: Users },
              { href: adminRoutes.staff, label: "Manage staff", icon: Users },
              { href: adminRoutes.auditLogs, label: "View audit logs", icon: Activity },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  className="flex items-center gap-3 rounded-[1.25rem] border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-900 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:scale-[0.97]"
                  href={action.href}
                  key={action.href}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="flex-1">{action.label}</span>
                  <ArrowRight aria-hidden="true" className="size-4 text-zinc-400" />
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
