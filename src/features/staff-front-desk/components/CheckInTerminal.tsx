"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import {
  CheckCircle2,
  CreditCard,
  Keyboard,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import {
  useCreateStaffCheckIn,
  useStaffMemberSearch,
  useStaffTodayCheckIns,
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
import { formatVnTime } from "@/lib/date/vn-time"

export function CheckInTerminal() {
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [selectedMember, setSelectedMember] =
    useState<StaffFrontDeskMemberSummary | null>(null)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const members = useStaffMemberSearch(submittedQuery)
  const todayCheckIns = useStaffTodayCheckIns()
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
        reasonCode:
          selectedMember.membershipStatus === "pending"
            ? "PAYMENT_PENDING"
            : "NO_ACTIVE_MEMBERSHIP",
        safeMessage:
          "Từ chối check-in. Hội viên cần có gói đang hoạt động và đã thanh toán trước khi vào phòng.",
      })
      return
    }

    const nextResult = (await checkIn.mutateAsync(selectedMember.id)) as CheckInResult
    setResult(nextResult)
    toast.success("Đã xác nhận check-in")
  }

  return (
    <div className="space-y-5">
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

          {/* <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
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
          </div> */}
        </section>

        <section className="gm-panel p-5">
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
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/staff/renew-package?memberId=${selectedMember.id}&query=${selectedMember.memberCode}`}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
                >
                  <RefreshCw className="size-3.5" />
                  Gia hạn gói tập
                </Link>
                <Link
                  href={`/staff/payments?query=${selectedMember.fullName}`}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 text-xs font-semibold text-white transition hover:bg-zinc-850 active:scale-[0.98]"
                >
                  <CreditCard className="size-3.5" />
                  Thanh toán ngay
                </Link>
              </div>
            </div>
          ) : null}

          <button
            className="mt-5 min-h-12 w-full rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_14px_34px_color-mix(in_oklch,var(--primary)_22%,transparent)] transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
            <>
              <CheckInResultPanel
                checkedInAt={result.checkedInAt}
                message={result.safeMessage}
                status={result.status === "checked-in" ? "success" : "blocked"}
              />
              {result.status !== "checked-in" && selectedMember ? (
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/staff/renew-package?memberId=${selectedMember.id}&query=${selectedMember.memberCode}`}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
                  >
                    <RefreshCw className="size-3.5" />
                    Gia hạn gói tập
                  </Link>
                  <Link
                    href={`/staff/payments?query=${selectedMember.fullName}`}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 text-xs font-semibold text-white transition hover:bg-zinc-850 active:scale-[0.98]"
                  >
                    <CreditCard className="size-3.5" />
                    Thanh toán ngay
                  </Link>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="gm-panel p-5">
          <p className="text-sm font-semibold text-foreground">Luồng vào phòng hôm nay</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <CheckInMetric
              label="Tổng check-in"
              value={todayCheckIns.isLoading ? "…" : (todayCheckIns.data?.stats.total ?? 0)}
              helper="Hôm nay"
            />
            <CheckInMetric
              label="Tại quầy"
              value={todayCheckIns.isLoading ? "…" : (todayCheckIns.data?.stats.frontDesk ?? 0)}
              helper="Lễ tân hoặc PT xác nhận"
            />
            <CheckInMetric
              label="Tự check-in"
              value={todayCheckIns.isLoading ? "…" : (todayCheckIns.data?.stats.selfService ?? 0)}
              helper="Hội viên tự quét"
            />
            <CheckInMetric
              label="Lượt hội viên"
              value={todayCheckIns.isLoading ? "…" : (todayCheckIns.data?.stats.uniqueMembers ?? 0)}
              helper="Khách duy nhất"
            />
          </div>
        </div>

        <div className="gm-panel p-5">
          <p className="text-sm font-semibold text-foreground">Check-in gần đây</p>
          {todayCheckIns.isLoading ? (
            <StateBlock
              className="mt-4"
              description="Đang tải lượt check-in hôm nay."
              title="Đang tải..."
              tone="loading"
            />
          ) : todayCheckIns.isError ? (
            <StateBlock
              className="mt-4"
              description="Không tải được lượt check-in hôm nay. Vui lòng thử lại."
              title="Lỗi tải dữ liệu"
              tone="error"
            />
          ) : (todayCheckIns.data?.items.length ?? 0) === 0 ? (
            <StateBlock
              className="mt-4"
              description="Các lượt check-in trong ngày sẽ hiển thị tại đây."
              title="Chưa có check-in nào hôm nay."
              tone="empty"
            />
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {todayCheckIns.data?.items.slice(0, 6).map((item) => (
                <div
                  className="gm-panel-muted flex items-center gap-3 p-3"
                  key={item.id}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {checkInInitials(item.memberName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.memberName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCheckInTime(item.checkInAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {item.source === "member" ? "Tự check-in" : "Tại quầy"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function checkInInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  )
}

function formatCheckInTime(checkInAt: string) {
  return formatVnTime(checkInAt, { hour: "2-digit", minute: "2-digit" }) || "--:--"
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
  value: number | string
}) {
  return (
    <div className="gm-panel-muted p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className={`mt-1 text-xs font-semibold ${tone === "danger" ? "text-destructive" : "text-primary"}`}>
        {helper}
      </p>
    </div>
  )
}
