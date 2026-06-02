"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  CheckCircle2,
  CreditCard,
  Keyboard,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import {
  useCreateStaffCheckIn,
  useStaffMemberSearch,
} from "@/features/staff-front-desk/api/staff-front-desk.queries"
import {
  BlockedHint,
  CheckInResultPanel,
  StaffMemberCard,
} from "@/features/staff-front-desk/components/StaffTemplateParts"
import {
  checkInSchema,
  type CheckInInput,
} from "@/features/staff-front-desk/schemas/staff-front-desk.schemas"
import type {
  CheckInResult,
  StaffFrontDeskMemberSummary,
} from "@/features/staff-front-desk/types/staff-front-desk.types"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"
import { toStatusPillStatus } from "@/features/staff-front-desk/utils/staff-status"

export function CheckInTerminal() {
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [selectedMember, setSelectedMember] =
    useState<StaffFrontDeskMemberSummary | null>(null)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const members = useStaffMemberSearch(submittedQuery)
  const checkIn = useCreateStaffCheckIn()
  const mutationError = checkIn.error ? mapStaffOperationError(checkIn.error) : null
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CheckInInput>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      query: "",
    },
  })

  function onSearch(values: CheckInInput) {
    setSubmittedQuery(values.query)
    setSelectedMember(null)
    setResult(null)
  }

  async function onConfirm() {
    if (!selectedMember) return

    if (selectedMember.membershipStatus !== "active") {
      setResult({
        memberId: selectedMember.id,
        status: "denied",
        reasonCode: "MEMBERSHIP_INACTIVE",
        safeMessage:
          "Từ chối check-in. Hội viên cần có gói đang hoạt động và đã thanh toán trước khi vào phòng.",
      })
      return
    }

    const nextResult = await checkIn.mutateAsync(selectedMember.id)
    setResult(nextResult)
    toast.success("Đã xác nhận check-in")
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <RuleCard icon={CreditCard} label="Chế độ terminal" title="Tra cứu nhanh" />
        <RuleCard icon={ShieldCheck} label="Quy tắc vào phòng" title="Gói paid active" />
        <RuleCard icon={XCircle} label="Từ chối & xử lý" title="Có hướng xử lý" tone="danger" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-xl shadow-zinc-950/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Tra cứu hội viên
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Nhập mã, SĐT hoặc email
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
                Quét thẻ, nhập thông tin và nhấn Tìm kiếm để kiểm tra nhanh trạng thái gói tập.
              </p>
            </div>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary">
              <Zap aria-hidden="true" className="size-6" />
            </span>
          </div>

          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit(onSearch)}
          >
            <label className="sr-only" htmlFor="check-in-search">
              Tìm hội viên để check-in
            </label>
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-zinc-500"
              />
              <input
                className="min-h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-5 text-lg text-white outline-none transition placeholder:text-zinc-500 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                data-testid="staff-checkin-search"
                id="check-in-search"
                placeholder="Mã hội viên, số điện thoại hoặc email"
                {...register("query")}
              />
            </div>
            <button
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
              type="submit"
            >
              <Search aria-hidden="true" className="size-4" />
              Tìm kiếm
            </button>
          </form>

          {errors.query ? (
            <p className="mt-3 text-sm font-medium text-red-200">
              {errors.query.message}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-400">Gợi ý nhanh</span>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Tra cứu thủ công
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              {["Quét thẻ", "Tìm theo SĐT", "Tìm theo email", "Xóa"].map((item, index) => (
                <span
                  className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-zinc-300"
                  key={item}
                >
                  <Keyboard aria-hidden="true" className="size-3.5 text-primary" />
                  {index === 3 ? "Esc" : `F${index + 1}`} · {item}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <CheckCircle2 aria-hidden="true" className="size-4 text-primary" />
              Trạng thái gói, thanh toán và quyền vào phòng được kiểm tra trước.
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Kết quả tra cứu
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Kết quả ra vào
              </h2>
            </div>
            <StatusPill
              status={
                selectedMember
                  ? toStatusPillStatus(selectedMember.membershipStatus)
                  : "pending"
              }
            />
          </div>

          {!submittedQuery ? (
            <StateBlock
              className="mt-4"
              description="Tìm theo mã hội viên, số điện thoại, email hoặc tên trước khi xác nhận vào phòng."
              title="Tìm hội viên để tải kết quả."
              tone="empty"
            />
          ) : null}
          {members.isLoading ? (
            <StateBlock
              className="mt-4"
              description="Đang kiểm tra trạng thái hội viên trước khi xác nhận vào phòng."
              title="Đang tải hội viên..."
              tone="loading"
            />
          ) : null}
          {members.data?.items.length === 0 ? (
            <StateBlock
              className="mt-4"
              description="Thử tìm bằng mã, số điện thoại, email hoặc tên hội viên khác."
              title="Không tìm thấy hội viên phù hợp."
              tone="empty"
            />
          ) : null}

          <div className="mt-4 grid gap-3">
            {members.data?.items.map((member) => (
              <StaffMemberCard
                key={member.id}
                member={member}
                onSelect={() => {
                  setSelectedMember(member)
                  setResult(null)
                }}
                selected={selectedMember?.id === member.id}
              />
            ))}
          </div>

          {selectedMember && selectedMember.membershipStatus !== "active" ? (
            <div className="mt-4">
              <BlockedHint>
                Hội viên chưa đủ điều kiện vào phòng cho đến khi gói tập đang hoạt động và đã thanh toán.
              </BlockedHint>
            </div>
          ) : null}

          <button
            className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="staff-checkin-confirm"
            disabled={!selectedMember || checkIn.isPending}
            onClick={onConfirm}
            type="button"
          >
            {checkIn.isPending ? "Đang xác nhận..." : "Xác nhận check-in"}
          </button>

          {mutationError ? (
            <StateBlock
              className="mt-3"
              description="Xử lý vấn đề gói tập trước khi xác nhận vào phòng."
              title={mutationError.message}
              tone="error"
            />
          ) : null}

          {result ? (
            <CheckInResultPanel
              checkedInAt={result.checkedInAt}
              message={result.safeMessage}
              status={result.status === "checked-in" ? "success" : "blocked"}
            />
          ) : null}
        </section>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Luồng vào phòng hôm nay</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <CheckInMetric label="Tổng check-in" value="68" helper="+12% so với hôm qua" />
            <CheckInMetric label="Được vào" value="62" helper="91%" />
            <CheckInMetric label="Từ chối" value="6" helper="9%" tone="danger" />
            <CheckInMetric label="Đang tập" value="54" helper="Hiện tại" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Check-in gần đây</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["Le Hoang My", "Pham Quoc Huy", "Nguyen Van An", "Vo Minh Duc"].map((name, index) => (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3" key={name}>
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {name.split(" ").slice(-2).map((part) => part[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">10:{23 - index * 2}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${index === 1 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                  {index === 1 ? "Từ chối" : "Được vào"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function RuleCard({
  icon: Icon,
  label,
  title,
  tone = "success",
}: {
  icon: typeof CreditCard
  label: string
  title: string
  tone?: "success" | "danger"
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className={`flex size-12 items-center justify-center rounded-full ${tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</p>
        </div>
      </div>
    </section>
  )
}

function CheckInMetric({
  helper,
  label,
  tone = "success",
  value,
}: {
  helper: string
  label: string
  tone?: "success" | "danger"
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className={`mt-1 text-xs font-semibold ${tone === "danger" ? "text-destructive" : "text-primary"}`}>
        {helper}
      </p>
    </div>
  )
}
