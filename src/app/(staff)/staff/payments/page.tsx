"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileText,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react"

import { StaffPageFrame } from "@/features/staff-front-desk/components/StaffPageFrame"
import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"

const paymentQueue = [
  {
    id: "PAY-2406-001",
    member: "Nguyen Minh Anh",
    code: "GM-101",
    packageName: "Premium 30",
    amount: "900.000đ",
    source: "Bán gói",
    status: "Chờ ghi nhận",
    createdAt: "10:15 hôm nay",
    priority: "normal",
  },
  {
    id: "PAY-2406-002",
    member: "Tran Bao Long",
    code: "GM-102",
    packageName: "Strength 90",
    amount: "2.400.000đ",
    source: "Gia hạn",
    status: "Cần xác minh",
    createdAt: "09:42 hôm nay",
    priority: "high",
  },
  {
    id: "PAY-2406-003",
    member: "Le Hoang My",
    code: "GM-103",
    packageName: "Premium 30",
    amount: "900.000đ",
    source: "Gia hạn",
    status: "Đã ghi nhận",
    createdAt: "Hôm qua",
    priority: "done",
  },
]

const activities = [
  {
    time: "10:18",
    title: "Ghi nhận thanh toán tiền mặt",
    description: "Nguyen Minh Anh · Premium 30 · 900.000đ",
    status: "success",
  },
  {
    time: "09:45",
    title: "Tạo pending payment",
    description: "Tran Bao Long · Strength 90 · 2.400.000đ",
    status: "warning",
  },
  {
    time: "09:12",
    title: "Xác nhận gia hạn",
    description: "Le Hoang My · Premium 30",
    status: "success",
  },
  {
    time: "08:55",
    title: "Đồng bộ giao dịch bán gói",
    description: "Mock API catalog · Staff workspace",
    status: "neutral",
  },
]

function StaffPaymentsPageContent() {
  const searchParams = useSearchParams()
  const queryParam = searchParams?.get("query") ?? ""
  const [searchQuery, setSearchQuery] = useState(queryParam)

  const filteredQueue = paymentQueue.filter((payment) => {
    const q = searchQuery.toLowerCase()
    return (
      payment.member.toLowerCase().includes(q) ||
      payment.code.toLowerCase().includes(q) ||
      payment.id.toLowerCase().includes(q)
    )
  })

  return (
    <StaffPageFrame
      description="Theo dõi các khoản thanh toán thủ công phát sinh sau khi bán hoặc gia hạn gói tập."
      title="Thanh toán"
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <PaymentMetricCard
            helper="Cần lễ tân xác nhận"
            icon={Clock3}
            label="Chờ ghi nhận"
            tone="warning"
            value="12"
          />
          <PaymentMetricCard
            helper="+18% so với hôm qua"
            icon={CheckCircle2}
            label="Đã ghi nhận"
            tone="success"
            value="8"
          />
          <PaymentMetricCard
            helper="Tiền mặt / chuyển khoản"
            icon={Banknote}
            label="Tổng pending"
            tone="info"
            value="8.45M"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Payment Queue
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    Hàng đợi thanh toán thủ công
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Các giao dịch phát sinh sau bán/gia hạn gói cần được xác nhận trước khi kích hoạt quyền vào phòng.
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
                    placeholder="Tìm theo tên hội viên, mã hội viên, mã giao dịch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>
              </div>

              <div className="divide-y divide-border">
                {filteredQueue.length > 0 ? (
                  filteredQueue.map((payment) => (
                    <PaymentQueueRow key={payment.id} payment={payment} />
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Không tìm thấy giao dịch thanh toán phù hợp.
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
                description="Nếu khoản thanh toán chưa rõ nguồn, giữ trạng thái pending và xử lý qua màn bán/gia hạn gói thay vì tự kích hoạt trực tiếp."
                items={[
                  "Không xác nhận giao dịch thiếu số tiền",
                  "Không kích hoạt gói khi chưa paid",
                  "Ghi nhận audit sau mỗi thao tác",
                  "Ưu tiên xử lý gói đã check-in",
                ]}
              />
            </section>
          </main>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Tổng kết ca hiện tại</p>

              <div className="mt-5 flex items-center gap-5">
                <div
                  className="flex size-32 items-center justify-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(hsl(var(--primary)) 0deg 262deg, hsl(var(--muted)) 262deg 360deg)",
                  }}
                >
                  <div className="flex size-24 flex-col items-center justify-center rounded-full bg-card">
                    <p className="text-2xl font-semibold text-foreground">73%</p>
                    <p className="text-xs text-muted-foreground">đã xử lý</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <SummaryLine label="Queue" value="12" />
                  <SummaryLine label="Đã xử lý" value="8" />
                  <SummaryLine label="Còn lại" value="4" />
                </div>
              </div>

              <button
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
                type="button"
              >
                <Download aria-hidden="true" className="size-4" />
                Xuất báo cáo ca
              </button>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Hoạt động thanh toán
                </p>
                <span className="text-xs font-semibold text-primary">Gần đây</span>
              </div>

              <div className="relative mt-5 space-y-5 before:absolute before:bottom-3 before:left-[4.25rem] before:top-3 before:w-px before:bg-border">
                {activities.map((activity) => (
                  <div
                    className="grid grid-cols-[56px_24px_minmax(0,1fr)] gap-3"
                    key={`${activity.time}-${activity.title}`}
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      {activity.time}
                    </span>
                    <span
                      className={`relative z-10 mt-1 size-3 rounded-full ring-4 ring-card ${
                        activity.status === "warning"
                          ? "bg-orange-500"
                          : activity.status === "success"
                            ? "bg-primary"
                            : "bg-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </StaffPageFrame>
  )
}

export default function StaffPaymentsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground p-5">Đang tải trang thanh toán...</div>}>
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
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">{helper}</p>
        </div>
      </div>
    </article>
  )
}

function PaymentQueueRow({
  payment,
}: {
  payment: {
    id: string
    member: string
    code: string
    packageName: string
    amount: string
    source: string
    status: string
    createdAt: string
    priority: string
  }
}) {
  const isDone = payment.priority === "done"
  const isHigh = payment.priority === "high"

  return (
    <article className="grid gap-4 px-5 py-4 transition hover:bg-muted/35 lg:grid-cols-[1.35fr_1fr_0.8fr_0.8fr_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {payment.member
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{payment.member}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {payment.code} · {payment.id}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{payment.packageName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{payment.source}</p>
      </div>

      <p className="text-sm font-semibold text-foreground">{payment.amount}</p>

      <div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isDone
              ? "bg-primary/10 text-primary"
              : isHigh
                ? "bg-destructive/10 text-destructive"
                : "bg-orange-500/10 text-orange-600"
          }`}
        >
          {payment.status}
        </span>
        <p className="mt-1 text-xs text-muted-foreground">{payment.createdAt}</p>
      </div>

      <button
        className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98] ${
          isDone
            ? "border border-border bg-card text-foreground hover:bg-muted"
            : "bg-primary text-primary-foreground hover:brightness-95"
        }`}
        type="button"
      >
        {isDone ? "Xem biên lai" : "Ghi nhận"}
      </button>
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
            <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-primary" />
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}
