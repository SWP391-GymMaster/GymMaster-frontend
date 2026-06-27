"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  DollarSign,
  Users,
  UserCheck,
} from "lucide-react";

import { DashboardMetricCard } from "@/features/admin-dashboard/components/DashboardMetricCard";
import { useDashboardSummary } from "@/features/admin-dashboard/api/admin-dashboard.queries";
import { useChartColors } from "@/hooks/use-chart-colors";

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompactVnd(amount: number) {
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)} triệu`;
  }
  return formatVnd(amount);
}

export function AdminDashboardContent() {
  const summary = useDashboardSummary();
  const c = useChartColors();

  if (summary.isLoading) {
    return (
      <div className="grid gap-5 xl:grid-cols-4">
        <DashboardMetricCard isLoading label="Doanh thu tháng" value="" />
        <DashboardMetricCard isLoading label="Hội viên active" value="" />
        <DashboardMetricCard isLoading label="Check-in hôm nay" value="" />
        <DashboardMetricCard isLoading label="Thanh toán chờ xử lý" value="" />
      </div>
    );
  }

  if (summary.error) {
    const message =
      summary.error instanceof Error
        ? summary.error.message
        : "Không thể tải dữ liệu dashboard.";

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
    );
  }

  const data = summary.data;
  const revenue = data?.revenue ?? 0;
  const todayCheckIns =
    data?.checkinsByDay?.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const pendingPaymentAmount = data?.pendingPaymentAmount ?? 0;
  const pendingPaymentCount = data?.pendingPaymentCount ?? 0;

  const previousMonthRevenue = data?.previousMonthRevenue ?? 0;
  const revenueChangePercent =
    previousMonthRevenue > 0
      ? Math.round(((revenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : null;
  const revenueTrend =
    revenueChangePercent !== null
      ? {
          direction: (revenueChangePercent >= 0 ? "up" : "down") as "up" | "down",
          label: `${revenueChangePercent >= 0 ? "+" : ""}${revenueChangePercent}% so với tháng trước`,
        }
      : { direction: "neutral" as const, label: "Tháng đầu tiên" };

  const newMembershipsThisMonth = data?.newMembershipsThisMonth;
  const activeTrend =
    newMembershipsThisMonth !== undefined
      ? {
          direction: (newMembershipsThisMonth > 0 ? "up" : "neutral") as "up" | "neutral",
          label: newMembershipsThisMonth > 0 ? `+${newMembershipsThisMonth} hợp đồng tháng này` : "Không có hợp đồng mới",
        }
      : { direction: "neutral" as const, label: "—" };

  const peakHourStart = data?.peakHourStart ?? 0;
  const peakHourEnd = data?.peakHourEnd ?? 0;
  const peakLabel =
    peakHourEnd > 0
      ? `Cao điểm ${String(peakHourStart).padStart(2, "0")}:00 - ${String(peakHourEnd).padStart(2, "0")}:00`
      : "Chưa đủ dữ liệu giờ cao điểm";

  const chartData = (data?.revenueByMonth ?? []).map((item) => ({
    month: item.month,
    "Doanh thu": item.revenue,
  }));

  return (
    <div className="space-y-6">
      <section
        className="grid gap-5 xl:grid-cols-4"
        aria-label="Chỉ số quản trị"
      >
        <DashboardMetricCard
          className="min-h-[190px] rounded-2xl border-border bg-card shadow-sm"
          icon={DollarSign}
          label="DOANH THU THÁNG"
          trend={revenueTrend}
          value={formatCompactVnd(revenue)}
        />
        <DashboardMetricCard
          className="min-h-[190px] rounded-2xl border-border bg-card shadow-sm"
          icon={Users}
          label="HỘI VIÊN HOẠT ĐỘNG"
          trend={activeTrend}
          value={data?.activeCount ?? 0}
        />
        <DashboardMetricCard
          className="min-h-[190px] rounded-2xl border-border bg-card shadow-sm"
          icon={UserCheck}
          label="CHECK-IN HÔM NAY"
          trend={{ direction: "neutral", label: peakLabel }}
          value={todayCheckIns}
        />
        <DashboardMetricCard
          className="min-h-[190px] rounded-2xl border-l-4 border-border border-l-amber-500 bg-card shadow-sm"
          icon={AlertTriangle}
          iconColor="warning"
          label="THANH TOÁN CHỜ XỬ LÝ"
          trend={{
            direction: "neutral",
            label: `${pendingPaymentCount} hóa đơn cần xử lý`,
          }}
          value={formatVnd(pendingPaymentAmount)}
        />
      </section>

      <section>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
              Tăng trưởng doanh thu
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tổng doanh thu theo tháng trong kỳ gần nhất.
            </p>
          </div>

          <div className="mt-8 h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={chartData} margin={{ left: -10, right: 12 }}>
                  <CartesianGrid
                    stroke={c.border}
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="month"
                    tick={{ fontSize: 12, fill: c.mutedFg }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fontSize: 12, fill: c.mutedFg }}
                    tickFormatter={(value) =>
                      `${Math.round(Number(value) / 1_000_000)}tr`
                    }
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: c.cardBg,
                      border: `1px solid ${c.border}`,
                      borderRadius: "0.875rem",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
                      color: c.cardFg,
                    }}
                    labelStyle={{ color: c.cardFg, fontWeight: 600 }}
                    itemStyle={{ color: c.mutedFg }}
                    formatter={(value) => formatVnd(Number(value))}
                    labelFormatter={(label) =>
                      `Tháng ${String(label).replace("T", "")}`
                    }
                  />
                  <Bar
                    dataKey="Doanh thu"
                    fill={c.primary}
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
      </section>
    </div>
  );
}
