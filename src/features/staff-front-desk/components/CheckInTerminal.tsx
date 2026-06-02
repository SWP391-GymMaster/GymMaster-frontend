"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { CheckCircle2, Search, ShieldAlert } from "lucide-react"
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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 text-white shadow-xl shadow-zinc-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Tra cứu vào phòng
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Terminal check-in
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-400">
              Xác minh trạng thái gói tập trước khi cho hội viên vào phòng.
              Gói đang hoạt động được check-in ngay; gói chưa hợp lệ sẽ bị chặn.
            </p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary">
            <ShieldAlert className="size-6" />
          </span>
        </div>
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit(onSearch)}
        >
          <label className="sr-only" htmlFor="check-in-search">
            Tìm hội viên để check-in
          </label>
          <input
            className="min-h-14 flex-1 rounded-2xl border border-white/15 bg-white/10 px-5 text-lg text-white outline-none transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-zinc-500 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            data-testid="staff-checkin-search"
            id="check-in-search"
            placeholder="Mã hội viên, số điện thoại, email hoặc tên"
            {...register("query")}
          />
          <button
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary/100 px-6 text-sm font-bold text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-95 active:scale-[0.98]"
            type="submit"
          >
            <Search className="size-4" />
            Tìm
          </button>
        </form>
        {errors.query ? (
          <p className="mt-3 text-sm font-medium text-red-200">
            {errors.query.message}
          </p>
        ) : null}
        <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-zinc-400">Chế độ terminal</span>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Tra cứu thủ công
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <CheckCircle2 className="size-4 text-primary" />
            Trạng thái gói, thanh toán và quyền vào phòng được kiểm tra trước.
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Kết quả
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-zinc-950">
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
          className="mt-5 min-h-12 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
  )
}
