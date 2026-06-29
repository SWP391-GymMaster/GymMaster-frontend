"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusPill } from "@/components/data/StatusPill"
import { formatVnDate } from "@/lib/date/vn-time"
import { StateBlock } from "@/components/feedback/StateBlock"
import {
  usePayments,
  usePaymentsSummary,
} from "@/features/billing/api/billing.queries"

// Backend trả timestamp UTC nhưng EF đọc từ SQL ra Kind=Unspecified nên JSON thiếu hậu
// tố 'Z' -> new Date() hiểu nhầm thành giờ máy (lệch -7h). Ép 'Z' để parse đúng UTC.
function ensureUtcIso(value: string) {
  return /[zZ]$|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`
}

export function PaymentsLogTable() {
  const { data: payments, isLoading, error } = usePayments()
  // Spec 003 §6 — bao cao doanh thu (GET /payments/summary)
  const { data: summary } = usePaymentsSummary()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "refunded">("all")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDateTime = (dateStr: string) => {
    return formatVnDate(ensureUtcIso(dateStr), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusLabel = (status: "paid" | "pending" | "refunded") => {
    if (status === "paid") return "Đã thanh toán"
    if (status === "pending") return "Đang chờ"
    return "Đã hoàn tiền"
  }

  const filteredPayments = (payments ?? []).filter((payment) => {
    const matchesSearch =
      payment.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.packageName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Bao cao doanh thu (spec 003 §6) */}
      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Doanh thu (đã thu)
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {formatPrice(summary.revenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Tổng giao dịch
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {summary.totalPayments}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Đã thanh toán
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {summary.paidPayments}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Đang chờ
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {summary.pendingPayments}
            </p>
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="min-h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"
              placeholder="Tìm theo hội viên, gói tập..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="payment-search-input"
            />
          </div>

          <div className="w-full sm:w-48">
            {/* Visually hidden native select for Playwright test compatibility */}
            <select
              id="payment-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "paid" | "pending" | "refunded")}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              data-testid="payment-status-filter"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán (Paid)</option>
              <option value="pending">Đang chờ (Pending)</option>
              <option value="refunded">Đã hoàn tiền (Refunded)</option>
            </select>

            <Select
              value={statusFilter}
              onValueChange={(val: string) => setStatusFilter(val as "all" | "paid" | "pending" | "refunded")}
            >
              <SelectTrigger className="min-h-11 w-full bg-background border border-border rounded-xl px-3 text-sm text-foreground focus-visible:ring-primary/20 focus-visible:border-primary">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
                <SelectItem value="all" className="focus:bg-white/5 focus:text-white">Tất cả trạng thái</SelectItem>
                <SelectItem value="paid" className="focus:bg-white/5 focus:text-white">Đã thanh toán (Paid)</SelectItem>
                <SelectItem value="pending" className="focus:bg-white/5 focus:text-white">Đang chờ (Pending)</SelectItem>
                <SelectItem value="refunded" className="focus:bg-white/5 focus:text-white">Đã hoàn tiền (Refunded)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <StateBlock tone="loading" title="Đang tải danh sách giao dịch..." />
      ) : error ? (
        <StateBlock
          tone="error"
          title="Lỗi tải dữ liệu giao dịch"
          description={error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định."}
        />
      ) : filteredPayments.length === 0 ? (
        <StateBlock
          tone="empty"
          title="Không tìm thấy giao dịch"
          description="Không có lịch sử thanh toán nào phù hợp với bộ lọc hiện tại."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full border-collapse text-left text-sm" data-testid="payments-table">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-6 py-4">Mã Giao Dịch</th>
                <th className="px-6 py-4">Hội viên</th>
                <th className="px-6 py-4">Gói tập</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Phương thức</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition hover:bg-muted/30"
                  data-testid={`payment-row-${payment.id}`}
                >
                  <td className="px-6 py-4 font-mono font-medium text-foreground">GD-{payment.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{payment.memberName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">ID hội viên: {payment.memberId}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{payment.packageName}</td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    {formatPrice(payment.amount)}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{payment.paymentMethod}</td>
                  <td className="px-6 py-4 text-zinc-500">{formatDateTime(payment.paymentDate)}</td>
                  <td className="px-6 py-4">
                    <StatusPill
                      status={payment.status}
                      label={getStatusLabel(payment.status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
