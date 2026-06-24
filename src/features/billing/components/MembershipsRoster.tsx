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
import { StateBlock } from "@/components/feedback/StateBlock"
import { useMemberships, usePackages } from "@/features/billing/api/billing.queries"
import { useManagedMembers } from "@/features/member-management/api/member-management.queries"
import type { Membership } from "@/features/billing/types/billing.types"

// Don "Cho thanh toan" qua 10 phut chua duoc xac nhan -> coi nhu da huy (giong staff/payments).
const PAYMENT_WINDOW_MS = 10 * 60 * 1000

type RosterStatus = "active" | "pending_payment" | "expired" | "cancelled"

function effectiveStatus(ms: Membership): RosterStatus {
  if (ms.status === "pending_payment" && ms.createdAt) {
    // createdAt tu backend la UTC nhung co the thieu hau to "Z" -> them de parse dung.
    const created = new Date(
      ms.createdAt.endsWith("Z") ? ms.createdAt : `${ms.createdAt}Z`,
    ).getTime()
    if (Date.now() - created > PAYMENT_WINDOW_MS) {
      return "cancelled"
    }
  }
  return ms.status as RosterStatus
}

export function MembershipsRoster() {
  const { data: memberships, isLoading: isMembershipsLoading, error: membershipsError } = useMemberships()
  const { data: packages, isLoading: isPackagesLoading } = usePackages()
  const { data: membersResult, isLoading: isMembersLoading } = useManagedMembers("")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending_payment" | "expired" | "cancelled">("all")

  const members = membersResult?.items ?? []

  const isLoading = isMembershipsLoading || isPackagesLoading || isMembersLoading

  const getMemberDetails = (memberId: number) => {
    return members.find((m) => m.id === memberId)
  }

  const getPackageDetails = (packageId: number) => {
    return packages?.find((p) => p.id === packageId)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const toStatusPillStatus = (status: "active" | "pending_payment" | "expired" | "cancelled") => {
    return status
  }

  const getStatusLabel = (status: "active" | "pending_payment" | "expired" | "cancelled") => {
    if (status === "active") return "Hoạt động"
    if (status === "pending_payment") return "Chờ thanh toán"
    if (status === "expired") return "Hết hạn"
    return "Đã hủy"
  }

  const filteredMemberships = (memberships ?? []).filter((ms) => {
    const member = getMemberDetails(ms.memberId)
    const pkg = getPackageDetails(ms.packageId)

    const memberName = member?.fullName ?? ""
    const memberCode = member?.memberCode ?? ""
    const packageName = pkg?.name ?? ""

    const matchesSearch =
      memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      packageName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || effectiveStatus(ms) === statusFilter

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
            <Input
              className="min-h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"
              placeholder="Tìm theo hội viên, mã, gói..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="membership-search-input"
            />
          </div>

          <div className="w-full sm:w-48">
            {/* Visually hidden native select for Playwright test compatibility */}
            <select
              id="membership-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "pending_payment" | "expired" | "cancelled")}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              data-testid="membership-status-filter"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động (Active)</option>
              <option value="pending_payment">Chờ thanh toán</option>
              <option value="expired">Hết hạn</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <Select
              value={statusFilter}
              onValueChange={(val: string) => setStatusFilter(val as "all" | "active" | "pending_payment" | "expired" | "cancelled")}
            >
              <SelectTrigger className="min-h-11 w-full bg-background border border-border rounded-xl px-3 text-sm text-foreground focus-visible:ring-primary/20 focus-visible:border-primary">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border border-white/10 text-white rounded-xl">
                <SelectItem value="all" className="focus:bg-white/5 focus:text-white">Tất cả trạng thái</SelectItem>
                <SelectItem value="active" className="focus:bg-white/5 focus:text-white">Hoạt động (Active)</SelectItem>
                <SelectItem value="pending_payment" className="focus:bg-white/5 focus:text-white">Chờ thanh toán</SelectItem>
                <SelectItem value="expired" className="focus:bg-white/5 focus:text-white">Hết hạn</SelectItem>
                <SelectItem value="cancelled" className="focus:bg-white/5 focus:text-white">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <StateBlock tone="loading" title="Đang tải danh sách hợp đồng..." />
      ) : membershipsError ? (
        <StateBlock
          tone="error"
          title="Lỗi tải dữ liệu hợp đồng"
          description={membershipsError instanceof Error ? membershipsError.message : "Đã xảy ra lỗi không xác định."}
        />
      ) : filteredMemberships.length === 0 ? (
        <StateBlock
          tone="empty"
          title="Không tìm thấy hợp đồng"
          description="Không có hợp đồng thẻ thành viên nào phù hợp với bộ lọc hiện tại."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full border-collapse text-left text-sm" data-testid="memberships-table">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-6 py-4">Mã Hợp Đồng</th>
                <th className="px-6 py-4">Hội viên</th>
                <th className="px-6 py-4">Gói tập</th>
                <th className="px-6 py-4">Ngày bắt đầu</th>
                <th className="px-6 py-4">Ngày kết thúc</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMemberships.map((ms) => {
                const member = getMemberDetails(ms.memberId)
                const pkg = getPackageDetails(ms.packageId)
                const displayStatus = effectiveStatus(ms)
                return (
                  <tr
                    key={ms.id}
                    className="transition hover:bg-muted/30"
                    data-testid={`membership-row-${ms.id}`}
                  >
                    <td className="px-6 py-4 font-mono font-medium text-foreground">HD-{ms.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-foreground">{member?.fullName ?? "Đang tải..."}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{member?.memberCode ?? ""}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{pkg?.name ?? `Gói tập #${ms.packageId}`}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{pkg?.durationDays ?? 30} ngày</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{formatDate(ms.startDate)}</td>
                    <td className="px-6 py-4 text-zinc-600">{formatDate(ms.endDate)}</td>
                    <td className="px-6 py-4">
                      <StatusPill
                        status={toStatusPillStatus(displayStatus)}
                        label={getStatusLabel(displayStatus)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
