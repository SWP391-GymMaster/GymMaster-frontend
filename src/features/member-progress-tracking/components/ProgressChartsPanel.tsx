"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { MockProgressEntry } from "@/features/member-progress-tracking/types/member-progress.types"

type ProgressChartsPanelProps = {
  entries: MockProgressEntry[]
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export function ProgressChartsPanel({ entries }: ProgressChartsPanelProps) {
  // Sort entries ascending by measuredAt for chronological chart rendering
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  )

  // Map to chart items
  const chartData = sortedEntries.map((entry) => ({
    ...entry,
    formattedDate: formatDate(entry.measuredAt),
  }))

  const hasBodyFatData = sortedEntries.some((entry) => entry.bodyFatPct !== undefined && entry.bodyFatPct !== null)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Cân nặng Trend */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Xu hướng Cân nặng (kg)
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Biểu đồ theo dõi sự thay đổi cân nặng theo thời gian.
          </p>
        </div>
        <div className="h-[260px] w-full" data-testid="progress-chart-weight">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.875rem",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
                  }}
                  formatter={(value) => [`${value} kg`, "Cân nặng"]}
                  labelFormatter={(label) => `Ngày đo: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="var(--gym-lime)"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Chưa có dữ liệu cân nặng.
            </div>
          )}
        </div>
      </section>

      {/* Tỷ lệ mỡ Trend */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Tỷ lệ mỡ cơ thể (%)
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Biểu đồ theo dõi tỷ lệ phần trăm mỡ của cơ thể.
          </p>
        </div>
        <div className="h-[260px] w-full" data-testid="progress-chart-fat">
          {chartData.length > 0 && hasBodyFatData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.875rem",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
                  }}
                  formatter={(value) => [`${value} %`, "Tỷ lệ mỡ"]}
                  labelFormatter={(label) => `Ngày đo: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="bodyFatPct"
                  stroke="var(--gym-steel)"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, strokeWidth: 1 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Chưa có dữ liệu tỷ lệ mỡ.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
