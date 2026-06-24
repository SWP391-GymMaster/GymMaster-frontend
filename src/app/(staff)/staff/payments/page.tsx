"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  ReceiptText,
  RefreshCw,
  Search,
} from "lucide-react"
import { toast } from "sonner"

import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"
import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"
import { StateBlock } from "@/components/feedback/StateBlock"
import { ApiClientError } from "@/lib/api/http-client"
import {
  useMemberships,
  usePackages,
  useConfirmMembershipPayment,
} from "@/features/billing/api/billing.queries"
import { useManagedMembers } from "@/features/member-management/api/member-management.queries"

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

// Hien dung ly do tu backend thay vi thong bao chung chung.
function confirmErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    switch (error.code) {
      case "ALREADY_HAS_ACTIVE":
        return "Hội viên đã có gói đang hoạt động — không thể kích hoạt thêm gói mới. Chờ gói hiện tại hết hạn hoặc dùng 'Gia hạn' để cộng nối thời hạn."
      case "DUPLICATE_PAYMENT":
        return "Đơn này đã được thanh toán trước đó."
      case "INSUFFICIENT_AMOUNT":
        return "Số tiền ghi nhận ít hơn giá gói tập."
      case "NOT_FOUND":
        return "Không tìm thấy đơn thanh toán này."
    }
  }
  return "Không ghi nhận được thanh toán. Vui lòng thử lại."
}

function StaffPaymentsPageContent() {
  const searchParams = useSearchParams()
  const queryParam = searchParams?.get("query") ?? ""
  const [searchQuery, setSearchQuery] = useState(queryParam)

  const { data: memberships, isLoading: isMembershipsLoading } = useMemberships()
  const { data: packages, isLoading: isPackagesLoading } = usePackages()
  const { data: membersResult, isLoading: isMembersLoading } =
    useManagedMembers("")
  const confirmPayment = useConfirmMembershipPayment()

  const members = membersResult?.items ?? []
  const isLoading = isMembershipsLoading || isPackagesLoading || isMembersLoading

  const rows = useMemo(() => {
    // Don pending qua 10 phut chua thanh toan -> coi nhu het han/huy.
    const PAYMENT_WINDOW_MS = 10 * 60 * 1000
    const now = Date.now()
    return (memberships ?? [])
      .map((ms) => {
        const member = members.find((m) => m.id === ms.memberId)
        const pkg = packages?.find((p) => p.id === ms.packageId)
        // createdAt cua backend la UTC nhung khong co hau to "Z" -> them vao de parse dung.
        const createdRaw = ms.createdAt
        const createdMs = createdRaw
          ? new Date(
              createdRaw.endsWith("Z") ? createdRaw : `${createdRaw}Z`,
            ).getTime()
          : now
        const expired =
          ms.status === "pending_payment" && now - createdMs > PAYMENT_WINDOW_MS
        return {
          id: ms.id,
          memberName: member?.fullName ?? `Hội viên #${ms.memberId}`,
          memberCode: member?.memberCode ?? "",
          packageName: pkg?.name ?? `Gói #${ms.packageId}`,
          amount: pkg?.price ?? 0,
          status: ms.status,
          expired,
        }
      })
      .filter((r) => r.status === "pending_payment" || r.status === "active")
      .sort((a, b) =>
        a.status === b.status ? 0 : a.status === "pending_payment" ? -1 : 1,
      )
  }, [memberships, members, packages])

  // Chi don pending con han moi can thu.
  const pending = rows.filter((r) => r.status === "pending_payment" && !r.expired)
  const activeCount = rows.filter((r) => r.status === "active").length
  const totalPending = pending.reduce((sum, r) => sum + r.amount, 0)

  const filteredRows = rows.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      r.memberName.toLowerCase().includes(q) ||
      r.memberCode.toLowerCase().includes(q) ||
      `hd-${r.id}`.includes(q)
    )
  })

  function handleConfirm(membershipId: number, amount: number) {
    confirmPayment.mutate(
      { membershipId, amount },
      {
        onSuccess: () =>
          toast.success("Đã ghi nhận thanh toán. Gói tập đã kích hoạt."),
        onError: (error) => toast.error(confirmErrorMessage(error)),
      },
    )
  }

  return (
    <StaffPageFrame
      description="Xác nhận các khoản thanh toán thủ công sau khi hội viên đăng ký hoặc gia hạn gói tập."
      title="Thanh toán"
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <PaymentMetricCard
            helper="Cần lễ tân xác nhận"
            icon={Clock3}
            label="Chờ thanh toán"
            tone="warning"
            value={String(pending.length)}
          />
          <PaymentMetricCard
            helper="Gói đang hoạt động"
            icon={CheckCircle2}
            label="Đã kích hoạt"
            tone="success"
            value={String(activeCount)}
          />
          <PaymentMetricCard
            helper="Tổng tiền chờ thu"
            icon={Banknote}
            label="Tổng chờ thu"
            tone="info"
            value={formatPrice(totalPending)}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Payment Queue
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Hàng đợi thanh toán
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Đơn chờ thanh toán cần xác nhận trước khi kích hoạt quyền vào
                phòng.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
                href={staffRoutes.sellPackage}
              >
                <CreditCard aria-hidden="true" className="size-4" />
                Bán gói
              </Link>
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
                href={staffRoutes.renewPackage}
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                Gia hạn
              </Link>
            </div>
          </div>

          <div className="border-b border-border p-5">
            <label className="relative block">
              <span className="sr-only">Tìm giao dịch thanh toán</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="min-h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                placeholder="Tìm theo tên hội viên, mã hội viên, mã đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-6">
                <StateBlock
                  tone="loading"
                  title="Đang tải hàng đợi thanh toán..."
                />
              </div>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <PaymentQueueRow
                  key={row.id}
                  row={row}
                  pending={confirmPayment.isPending}
                  onConfirm={() => handleConfirm(row.id, row.amount)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Không có đơn thanh toán nào.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <GuidanceCard
            icon={ReceiptText}
            title="Quy trình ghi nhận"
            description="Thanh toán chỉ nên được xác nhận sau khi lễ tân đối chiếu số tiền, hội viên, gói tập và phương thức thanh toán."
            items={[
              "Kiểm tra đúng hội viên",
              "Kiểm tra đúng gói và giá",
              "Ghi nhận tiền mặt hoặc chuyển khoản",
              "Kích hoạt trạng thái paid",
            ]}
          />
          <GuidanceCard
            icon={AlertTriangle}
            title="Cần lưu ý"
            description="Nếu khoản thanh toán chưa rõ nguồn, giữ trạng thái chờ và xử lý lại thay vì tự kích hoạt."
            items={[
              "Không xác nhận giao dịch thiếu số tiền",
              "Không kích hoạt gói khi chưa thu tiền",
              "Ghi nhận audit sau mỗi thao tác",
              "Ưu tiên xử lý gói đã check-in",
            ]}
          />
        </section>
      </div>
    </StaffPageFrame>
  )
}

export default function StaffPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground p-5">
          Đang tải trang thanh toán...
        </div>
      }
    >
      <StaffPaymentsPageContent />
    </Suspense>
  )
}

function PaymentMetricCard({
  helper,
  icon: Icon,
  label,
  tone,
  value,
}: {
  helper: string
  icon: typeof Clock3
  label: string
  tone: "warning" | "success" | "info"
  value: string
}) {
  const toneClass = {
    warning: "bg-orange-500/10 text-orange-600",
    success: "bg-primary/10 text-primary",
    info: "bg-blue-500/10 text-blue-600",
  }[tone]

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${toneClass}`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {helper}
          </p>
        </div>
      </div>
    </article>
  )
}

type QueueRow = {
  id: number
  memberName: string
  memberCode: string
  packageName: string
  amount: number
  status: string
  expired: boolean
}

function PaymentQueueRow({
  row,
  pending,
  onConfirm,
}: {
  row: QueueRow
  pending: boolean
  onConfirm: () => void
}) {
  const isDone = row.status === "active"
  const isCancelled = !isDone && row.expired

  return (
    <article className="grid gap-4 px-5 py-4 transition hover:bg-muted/35 lg:grid-cols-[1.35fr_1fr_0.8fr_0.8fr_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {row.memberName
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {row.memberName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {row.memberCode || `HV-${row.id}`} · HD-{row.id}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">
          {row.packageName}
        </p>
      </div>

      <p className="text-sm font-semibold text-foreground">
        {formatPrice(row.amount)}
      </p>

      <div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isDone
              ? "bg-primary/10 text-primary"
              : isCancelled
                ? "bg-destructive/10 text-destructive"
                : "bg-orange-500/10 text-orange-600"
          }`}
        >
          {isDone ? "Đã thanh toán" : isCancelled ? "Đã bị hủy" : "Chờ thanh toán"}
        </span>
      </div>

      {isDone ? (
        <span className="text-xs font-medium text-muted-foreground">
          Đã kích hoạt
        </span>
      ) : isCancelled ? (
        <span className="text-xs font-medium text-destructive">Hết hạn</span>
      ) : (
        <button
          disabled={pending}
          onClick={onConfirm}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
          type="button"
        >
          {pending ? "Đang xử lý..." : "Ghi nhận"}
        </button>
      )}
    </article>
  )
}

function GuidanceCard({
  description,
  icon: Icon,
  items,
  title,
}: {
  description: string
  icon: typeof FileText
  items: string[]
  title: string
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {items.map((item) => (
          <div
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            key={item}
          >
            <CheckCircle2
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}
