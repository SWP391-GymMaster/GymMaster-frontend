"use client"

import type { MockProgressEntry } from "@/features/member-progress-tracking/types/member-progress.types"
import { formatVnDate } from "@/lib/date/vn-time"

type ProgressHistoryTableProps = {
  entries: MockProgressEntry[]
}

function formatDate(dateStr: string) {
  try {
    return formatVnDate(dateStr, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

export function ProgressHistoryTable({ entries }: ProgressHistoryTableProps) {
  // Sort entries descending by measuredAt for showing the latest log first
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
  )

  return (
    <section className="gm-panel overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
          Lịch sử ghi nhận chỉ số
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Danh sách chi tiết các lần đo cân nặng và tỷ lệ mỡ cơ thể.
        </p>
      </div>

      {sortedEntries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Ngày ghi nhận</th>
                <th className="px-6 py-4">Cân nặng (kg)</th>
                <th className="px-6 py-4">Tỷ lệ mỡ (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors" data-testid="progress-history-row">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {formatDate(entry.measuredAt)}
                  </td>
                  <td className="px-6 py-4 text-foreground font-semibold">
                    {entry.weightKg} kg
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {entry.bodyFatPct !== undefined && entry.bodyFatPct !== null ? `${entry.bodyFatPct}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Chưa có chỉ số nào được ghi nhận</p>
          <p className="mt-1 text-xs">Hãy ghi nhận chỉ số cân nặng/mỡ đầu tiên của bạn.</p>
        </div>
      )}
    </section>
  )
}
