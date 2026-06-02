"use client"

import {
  CheckCircle2,
  Dumbbell,
  Filter,
  Handshake,
  Search,
  Star,
  UserRound,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  useAssignTrainer,
  useAssignmentCandidateMembers,
  useAssignmentCandidateTrainers,
} from "@/features/pt-assignment/api/pt-assignment.queries"
import type {
  AssignmentCandidateMember,
  AssignmentCandidateTrainer,
  AssignTrainerResult,
} from "@/features/pt-assignment/types/pt-assignment.types"
import { mapPtAssignmentError } from "@/features/pt-assignment/utils/pt-assignment-errors"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

const cardClass =
  "rounded-xl border border-zinc-200 bg-white shadow-[0_4px_24px_rgba(25,27,35,0.04)]"

export function AdminPtAssignmentWorkspace() {
  const [memberQuery, setMemberQuery] = useState("")
  const [trainerQuery, setTrainerQuery] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null)
  const [result, setResult] = useState<AssignTrainerResult | null>(null)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const membersQuery = useAssignmentCandidateMembers(memberQuery, true)
  const trainersQuery = useAssignmentCandidateTrainers(trainerQuery, specialty)
  const assignTrainer = useAssignTrainer()
  const members = useMemo(
    () => membersQuery.data?.items ?? [],
    [membersQuery.data?.items],
  )
  const trainers = useMemo(
    () => trainersQuery.data?.items ?? [],
    [trainersQuery.data?.items],
  )
  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ?? null
  const selectedTrainer =
    trainers.find((trainer) => trainer.id === selectedTrainerId) ?? null
  const mode = selectedMember?.currentTrainerId ? "reassign" : "assign"
  const canConfirm = Boolean(selectedMember && selectedTrainer)

  const needsPtCount = useMemo(
    () => members.filter((member) => !member.currentTrainerId).length,
    [members],
  )

  async function onConfirm() {
    if (!selectedMember || !selectedTrainer) {
      toast.error("Chọn một hội viên và một PT trước khi xác nhận.")
      return
    }

    try {
      setAssignmentError(null)
      const nextResult = await assignTrainer.mutateAsync({
        memberId: selectedMember.id,
        trainerId: selectedTrainer.id,
      })
      setResult(nextResult)
      toast.success(nextResult.message)
    } catch (error) {
      const mapped = mapPtAssignmentError(error)
      setResult(null)
      setAssignmentError(mapped.message)
      toast.error(mapped.message)
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-950">
            Phân công PT
          </h2>
          <p className="mt-1 text-sm font-semibold text-zinc-600">
            Ghép hội viên với PT, kiểm soát mỗi hội viên chỉ có một PT active và ghi audit.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <MetricPill label="Cần PT" value={String(needsPtCount)} tone="danger" />
          <MetricPill label="PT khả dụng" value={String(trainers.length)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className={cn(cardClass, "flex min-h-[620px] flex-col p-5 lg:col-span-4")}>
          <PanelHeader
            badge={`${needsPtCount} cần PT`}
            icon={<Users aria-hidden="true" className="size-4" />}
            title="Hội viên cần phân công"
          />
          <label className="relative mb-4">
            <span className="sr-only">Lọc hội viên</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            />
            <input
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              data-testid="assignment-member-search"
              onChange={(event) => setMemberQuery(event.target.value)}
              placeholder="Tìm hội viên..."
              value={memberQuery}
            />
          </label>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <AssignmentQueryState
              emptyTitle="Chưa có hội viên phù hợp"
              error={membersQuery.error}
              isLoading={membersQuery.isLoading}
              itemCount={members.length}
              loadingTitle="Đang tải hội viên..."
            />
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onSelect={() => {
                  setSelectedMemberId(member.id)
                  setResult(null)
                  setAssignmentError(null)
                }}
                selected={selectedMemberId === member.id}
              />
            ))}
          </div>
        </section>

        <section className={cn(cardClass, "flex min-h-[620px] flex-col p-5 lg:col-span-5")}>
          <PanelHeader
            action={
              <Button className="rounded-lg text-primary" type="button" variant="ghost">
                <Filter aria-hidden="true" className="size-4" />
                Lọc
              </Button>
            }
            icon={<Dumbbell aria-hidden="true" className="size-4" />}
            title="PT khả dụng"
          />
          <label className="relative mb-3">
            <span className="sr-only">Lọc PT</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            />
            <input
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              data-testid="assignment-trainer-search"
              onChange={(event) => setTrainerQuery(event.target.value)}
              placeholder="Tìm PT..."
              value={trainerQuery}
            />
          </label>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {["all", "Weight Loss", "Strength"].map((item) => (
              <button
                className={cn(
                  "min-h-9 rounded-full border px-3 text-sm font-bold transition active:scale-[0.98]",
                  specialty === item
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
                )}
                key={item}
                onClick={() => setSpecialty(item)}
                type="button"
              >
                {item === "all" ? "Tất cả chuyên môn" : displaySpecialty(item)}
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <AssignmentQueryState
              emptyTitle="Chưa có PT phù hợp"
              error={trainersQuery.error}
              isLoading={trainersQuery.isLoading}
              itemCount={trainers.length}
              loadingTitle="Đang tải PT..."
            />
            {trainers.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                onSelect={() => {
                  setSelectedTrainerId(trainer.id)
                  setResult(null)
                  setAssignmentError(null)
                }}
                selected={selectedTrainerId === trainer.id}
                trainer={trainer}
              />
            ))}
          </div>
        </section>

        <section className={cn(cardClass, "flex min-h-[620px] flex-col bg-zinc-50 p-5 lg:col-span-3")}>
          <PanelHeader
            icon={<Handshake aria-hidden="true" className="size-4" />}
            title="Xem trước"
          />
          <AssignmentPreview
            assignmentError={assignmentError}
            mode={mode}
            result={result}
            selectedMember={selectedMember}
            selectedTrainer={selectedTrainer}
          />
          <Button
            className="mt-auto min-h-14 rounded-xl bg-primary text-white hover:brightness-95 active:scale-[0.98]"
            data-testid="assignment-confirm-button"
            disabled={!canConfirm || assignTrainer.isPending}
            onClick={onConfirm}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" className="size-5" />
            {mode === "reassign" ? "Gửi yêu cầu phân công" : "Xác nhận phân công"}
          </Button>
        </section>
      </div>
    </section>
  )
}

function MetricPill({
  label,
  tone = "default",
  value,
}: {
  label: string
  tone?: "default" | "danger"
  value: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        tone === "danger"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-zinc-200 bg-white text-zinc-950",
      )}
    >
      <p className="text-xs font-black uppercase tracking-[0.08em]">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function PanelHeader({
  action,
  badge,
  icon,
  title,
}: {
  action?: React.ReactNode
  badge?: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <header className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <h3 className="text-xs font-black uppercase tracking-[0.1em] text-zinc-950">
          {title}
        </h3>
      </div>
      {badge ? (
        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
          {badge}
        </span>
      ) : null}
      {action}
    </header>
  )
}

function MemberCard({
  member,
  onSelect,
  selected,
}: {
  member: AssignmentCandidateMember
  onSelect: () => void
  selected: boolean
}) {
  return (
    <button
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/5"
          : "border-zinc-200 bg-white hover:bg-zinc-50",
      )}
      data-testid="assignment-member-card"
      onClick={onSelect}
      type="button"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-primary/10 font-black text-primary">
        {initials(member.fullName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-zinc-950">
          {member.fullName}
        </span>
        <span className="mt-1 block text-xs text-zinc-600">
          Mục tiêu: {member.goal ?? "Thể lực tổng quát"}
        </span>
        <span className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-sm bg-zinc-50 px-2 py-1 text-[10px] font-bold text-zinc-600">
            {member.memberCode}
          </span>
          {member.currentTrainerName ? (
            <span className="rounded-sm bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
              PT hiện tại: {member.currentTrainerName}
            </span>
          ) : (
            <span className="rounded-sm bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">
              Cần PT
            </span>
          )}
          {member.priority === "high" ? (
            <span className="rounded-sm bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
              Ưu tiên cao
            </span>
          ) : null}
        </span>
      </span>
    </button>
  )
}

function TrainerCard({
  onSelect,
  selected,
  trainer,
}: {
  onSelect: () => void
  selected: boolean
  trainer: AssignmentCandidateTrainer
}) {
  const nextCapacity = Math.min(trainer.assignedCount + 1, trainer.capacity)
  const percent = Math.round((nextCapacity / trainer.capacity) * 100)

  return (
    <button
      className={cn(
        "relative w-full rounded-lg border p-4 text-left transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
        selected
          ? "border-2 border-primary bg-primary/5"
          : "border-zinc-200 bg-white hover:bg-zinc-50",
      )}
      data-testid="assignment-trainer-card"
      onClick={onSelect}
      type="button"
    >
      {selected ? (
        <span className="absolute right-0 top-0 rounded-bl-lg bg-primary px-2 py-1 text-[10px] font-bold text-white">
          Đang chọn
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full border border-zinc-200 bg-primary/10 font-black text-primary">
            {initials(trainer.fullName)}
          </span>
          <span>
            <span className="block text-sm font-bold text-zinc-950">
              {trainer.fullName}
            </span>
            <span className="block text-xs text-zinc-600">
              Chuyên môn: {displaySpecialty(trainer.specialty)}
            </span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-sm bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
          <Star aria-hidden="true" className="size-3 fill-current" />
          {trainer.rating?.toFixed(1) ?? "4.8"}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs font-semibold">
            <span className="text-zinc-600">Tải hiện tại</span>
            <span className={percent >= 90 ? "text-red-700" : "text-primary"}>
              {nextCapacity}/{trainer.capacity} suất
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-primary/10">
            <div
              className={cn(
                "h-1.5 rounded-full",
                percent >= 90 ? "bg-red-700" : "bg-primary",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <span
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-bold",
            selected
              ? "bg-primary text-white"
              : "border border-zinc-200 text-zinc-950",
          )}
        >
          {selected ? "Đã chọn" : "Chọn"}
        </span>
      </div>
    </button>
  )
}

function AssignmentPreview({
  assignmentError,
  mode,
  result,
  selectedMember,
  selectedTrainer,
}: {
  assignmentError: string | null
  mode: "assign" | "reassign"
  result: AssignTrainerResult | null
  selectedMember: AssignmentCandidateMember | null
  selectedTrainer: AssignmentCandidateTrainer | null
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-5">
      <PreviewIdentity
        empty="Chọn hội viên"
        label={selectedMember?.goal ? `Mục tiêu: ${selectedMember.goal}` : undefined}
        name={selectedMember?.fullName}
      />
      <div className="flex flex-col items-center py-5 text-primary">
        <div className="h-8 border-l-2 border-dashed border-primary/40" />
        <span className="rounded-full bg-primary/10 p-3">
          <Handshake aria-hidden="true" className="size-5" />
        </span>
        <div className="h-8 border-l-2 border-dashed border-primary/40" />
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <PreviewIdentity
          empty="Chọn PT"
          label={
            selectedTrainer
              ? `Chuyên môn: ${displaySpecialty(selectedTrainer.specialty)}`
              : undefined
          }
          name={selectedTrainer?.fullName}
        />
        {selectedMember && selectedTrainer ? (
          <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <p className="mb-2 text-xs font-bold text-zinc-600">
              {mode === "reassign" ? "Không thể phân công mới" : "Phân công mới"}
            </p>
            <div className="flex items-center justify-between text-sm font-bold text-zinc-950">
              <span>Số suất sau phân công</span>
              <span className="text-primary">
                {selectedTrainer.assignedCount + 1} / {selectedTrainer.capacity}
              </span>
            </div>
            {mode === "reassign" && selectedMember.currentTrainerName ? (
              <p className="mt-2 text-xs text-zinc-600">
                {selectedMember.currentTrainerName} đang là PT active. Theo tài liệu final, backend trả 422 cho đến khi assignment cũ kết thúc.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {assignmentError ? (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700"
          data-testid="assignment-error"
        >
          <p className="text-sm font-black">Không thể phân công PT</p>
          <p className="mt-1 text-xs font-semibold">{assignmentError}</p>
        </div>
      ) : null}
      {result ? (
        <div
          className="mt-4 rounded-xl border border-[color:var(--status-active-border)] bg-[var(--status-active-bg)] p-3"
          data-testid="assignment-success"
        >
          <div className="flex items-center gap-2 text-sm font-black text-[var(--status-active-text)]">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {result.message}
          </div>
          <p className="mt-1 text-xs font-semibold text-[var(--status-active-text)]">
            Audit Log #{result.auditLogId} · ASSIGN_PT
          </p>
          {result.previousAssignment ? (
            <p className="mt-1 text-xs text-[var(--status-active-text)]">
              Phân công cũ #{result.previousAssignment.id} đã kết thúc.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function PreviewIdentity({
  empty,
  label,
  name,
}: {
  empty: string
  label?: string
  name?: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 flex size-16 items-center justify-center rounded-full border-4 border-white bg-primary text-lg font-black text-white shadow-sm">
        {name ? initials(name) : <UserRound aria-hidden="true" className="size-6" />}
      </div>
      <h4 className="font-bold text-zinc-950">{name ?? empty}</h4>
      {label ? (
        <span className="mt-1 rounded-sm bg-zinc-50 px-2 py-1 text-[10px] font-bold text-zinc-600">
          {label}
        </span>
      ) : null}
    </div>
  )
}

function AssignmentQueryState({
  emptyTitle,
  error,
  isLoading,
  itemCount,
  loadingTitle,
}: {
  emptyTitle: string
  error: unknown
  isLoading: boolean
  itemCount: number
  loadingTitle: string
}) {
  if (isLoading) {
    return (
      <StateBlock
        description="Đang tải dữ liệu phân công theo contract sở hữu PT."
        title={loadingTitle}
        tone="loading"
      />
    )
  }

  if (error) {
    const mapped = mapPtAssignmentError(error)
    return (
      <StateBlock
        description="Thử lại hoặc kiểm tra quyền Admin."
        title={mapped.message}
        tone="error"
      />
    )
  }

  if (itemCount === 0) {
    return (
      <StateBlock
        description="Điều chỉnh bộ lọc hoặc tạo hồ sơ quản lý còn thiếu trước."
        title={emptyTitle}
        tone="empty"
      />
    )
  }

  return null
}

function displaySpecialty(value?: string) {
  switch (value) {
    case "Weight Loss":
      return "Giảm mỡ"
    case "Strength":
      return "Sức mạnh"
    case "Cardio":
      return "Tim mạch"
    case "Mobility":
      return "Linh hoạt"
    case "General training":
      return "Tập luyện tổng quát"
    default:
      return value ?? "Tổng quát"
  }
}
