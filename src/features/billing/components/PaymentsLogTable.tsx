"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { usePayments } from "@/features/billing/api/billing.queries"

export function PaymentsLogTable() {
  const { data: payments, isLoading, error } = usePayments()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "failed">("all")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusLabel = (status: "paid" | "pending" | "failed") => {
    if (status === "paid") return "Đã thanh toán"
    if (status === "pending") return "Đang chờ"
    return "Thất bại"
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
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="min-h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
              placeholder="Tìm theo hội viên, gói tập..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="payment-search-input"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "paid" | "pending" | "failed")}
              data-testid="payment-status-filter"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán (Paid)</option>
              <option value="pending">Đang chờ (Pending)</option>
              <option value="failed">Thất bại (Failed)</option>
            </select>
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
