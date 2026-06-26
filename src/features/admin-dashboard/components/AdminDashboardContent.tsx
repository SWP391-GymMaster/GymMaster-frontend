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
} from "lucide-react";
import Link from "next/link";

import { DashboardMetricCard } from "@/features/admin-dashboard/components/DashboardMetricCard";
import { useDashboardSummary } from "@/features/admin-dashboard/api/admin-dashboard.queries";
import { adminRoutes } from "@/features/admin-dashboard/constants/admin-routes";
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

type DashboardOptionalFields = {
  pendingPaymentAmount?: number;
  pendingPaymentCount?: number;
  revenueByMonth?: { month: string; revenue: number }[];
  recentlyExpired?: {
    initials: string;
    memberName: string;
    packageName: string;
    expiredDate: string;
  }[];
  facilityLoadPercent?: number;
  ptSessionPercent?: number;
  generalAreaPercent?: number;
  previousMonthRevenue?: number;
  newMembershipsThisMonth?: number;
  peakHourStart?: number;
  peakHourEnd?: number;
};

function formatExpiredOn(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiredDate = new Date(dateStr);
  const diffDays = Math.floor((today.getTime() - expiredDate.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "1 ngày trước";
  return `${diffDays} ngày trước`;
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
  const optionalData = data as DashboardOptionalFields | undefined;
  const revenue = data?.revenue ?? 0;
  const todayCheckIns =
    data?.checkinsByDay?.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const pendingPaymentAmount = optionalData?.pendingPaymentAmount ?? 0;
  const pendingPaymentCount = optionalData?.pendingPaymentCount ?? 0;

  const facilityLoadPercent = optionalData?.facilityLoadPercent ?? 0;
  const ptSessionPercent = optionalData?.ptSessionPercent ?? 0;
  const generalAreaPercent = optionalData?.generalAreaPercent ?? 0;
  const facilityDeg = Math.round((facilityLoadPercent / 100) * 360);

  const previousMonthRevenue = optionalData?.previousMonthRevenue ?? 0;
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

  const newMembershipsThisMonth = optionalData?.newMembershipsThisMonth;
  const activeTrend =
    newMembershipsThisMonth !== undefined
      ? {
          direction: (newMembershipsThisMonth > 0 ? "up" : "neutral") as "up" | "neutral",
          label: newMembershipsThisMonth > 0 ? `+${newMembershipsThisMonth} mới tháng này` : "Không có mới",
        }
      : { direction: "neutral" as const, label: "—" };

  const peakHourStart = optionalData?.peakHourStart ?? 0;
  const peakHourEnd = optionalData?.peakHourEnd ?? 0;
  const peakLabel =
    peakHourEnd > 0
      ? `Cao điểm ${String(peakHourStart).padStart(2, "0")}:00 - ${String(peakHourEnd).padStart(2, "0")}:00`
      : "Chưa đủ dữ liệu giờ cao điểm";

  // Dung du lieu that tu backend; rong thi hien empty state (khong bia John Doe/Alice Smith).
  const recentlyExpiredList = (optionalData?.recentlyExpired ?? []).map((m) => ({
    id: m.initials,
    name: m.memberName,
    plan: m.packageName,
    expiredOn: formatExpiredOn(m.expiredDate),
  }));

  const chartData = (optionalData?.revenueByMonth ?? []).map((item) => ({
    month: item.month,
    "Doanh thu": item.revenue,
  }));

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

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Tải vận hành cơ sở
          </p>

          <div className="mt-9 flex justify-center">
            <div
              className="relative flex size-48 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${c.primary} 0deg ${facilityDeg}deg, ${c.muted} ${facilityDeg}deg 360deg)`,
              }}
            >
              <div className="flex size-36 flex-col items-center justify-center rounded-full bg-card shadow-inner">
                <p className="text-4xl font-semibold tracking-tight text-foreground">
                  {facilityLoadPercent}%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  giờ cao điểm
                </p>
              </div>
            </div>
          </div>

          <div className="mt-9 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-3 rounded-sm bg-primary" />
                Buổi PT
              </span>
              <span className="font-semibold text-foreground">{ptSessionPercent}%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-3 rounded-sm bg-muted ring-1 ring-border" />
                Khu vực tập chung
              </span>
              <span className="font-semibold text-foreground">{generalAreaPercent}%</span>
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
              {
                href: adminRoutes.members,
                label: "Hội viên mới",
                icon: UserPlus,
              },
              { href: adminRoutes.staff, label: "Thêm nhân sự", icon: UserCog },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-center text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md active:scale-[0.98]"
                  href={action.href}
                  key={action.href}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {action.label}
                </Link>
              );
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

            {recentlyExpiredList.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Không có gói nào vừa hết hạn cần xử lý.
              </div>
            ) : (
              recentlyExpiredList.map((member) => (
              <div
                className="grid grid-cols-[1.3fr_1fr_1fr_auto] items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
                key={member.id}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {member.id}
                  </span>
                  <span className="font-medium text-foreground">
                    {member.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {member.plan}
                </span>
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
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
