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

import { StatusPill } from "@/components/data/StatusPill"
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

const cardClass = "gm-panel"

export function AdminPtAssignmentWorkspace() {
  const [activeView, setActiveView] = useState<"list" | "assign">("list")
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

  const averageLoad = useMemo(() => {
    if (trainers.length === 0) return 0

    const totalRatio = trainers.reduce((sum, trainer) => {
      if (!trainer.capacity) return sum
      return sum + trainer.assignedCount / trainer.capacity
    }, 0)

    return Math.round((totalRatio / trainers.length) * 100)
  }, [trainers])

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
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Handshake aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Phân công PT
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Ghép hội viên với PT phù hợp theo mục tiêu, chuyên môn và tải hiện tại.
              </p>
            </div>
          </div>
        </div>

        {activeView === "list" ? (
          <Button
            onClick={() => setActiveView("assign")}
            className="min-h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:brightness-95"
            type="button"
          >
            Bắt đầu phân công PT
          </Button>
        ) : (
          <Button
            onClick={() => {
              setActiveView("list")
              setSelectedMemberId(null)
              setSelectedTrainerId(null)
              setResult(null)
              setAssignmentError(null)
            }}
            className="min-h-11 rounded-full border-border bg-[var(--surface-panel)] px-5 text-foreground hover:bg-muted"
            type="button"
            variant="outline"
          >
            ← Quay lại danh sách
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          helper="Chưa có PT phụ trách"
          icon={<Users aria-hidden="true" className="size-5" />}
          label="Hội viên cần phân công"
          tone="primary"
          value={String(needsPtCount)}
        />
        <MetricCard
          helper="Đang rảnh để nhận mới"
          icon={<Dumbbell aria-hidden="true" className="size-5" />}
          label="PT khả dụng"
          tone="success"
          value={String(trainers.length)}
        />
        <MetricCard
          helper="Tải trung bình theo sức chứa PT"
          icon={<Star aria-hidden="true" className="size-5" />}
          label="Công suất trung bình"
          tone="neutral"
          value={`${averageLoad}%`}
        />
      </div>

      {activeView === "list" ? (
        <div className="space-y-6">
          <section className="gm-panel space-y-4 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Danh sách phân công hiện tại</h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý và theo dõi các cặp huấn luyện viên - hội viên đang hoạt động.
                </p>
              </div>
              <Button
                onClick={() => setActiveView("assign")}
                className="rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:brightness-95 active:scale-[0.98]"
              >
                Tạo phân công mới
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-foreground">
                <thead>
                  <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pt-2">Hội viên</th>
                    <th className="pb-3 pt-2">Huấn luyện viên (PT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.filter((m) => m.currentTrainerName).length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-muted-foreground">
                        Chưa có phân công hoạt động nào.
                      </td>
                    </tr>
                  ) : (
                    members
                      .filter((m) => m.currentTrainerName)
                      .map((member) => (
                        <tr key={member.id} className="hover:bg-muted/30">
                          <td className="py-3.5">
                            <span className="font-semibold text-foreground">{member.fullName}</span>
                            <span className="block text-xs text-muted-foreground mt-0.5">{member.memberCode}</span>
                          </td>
                          <td className="py-3.5">
                            <span className="font-semibold text-primary">{member.currentTrainerName}</span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.88fr)_minmax(360px,1.08fr)_minmax(340px,0.74fr)]">
          <section className={cn(cardClass, "flex min-h-[640px] flex-col overflow-hidden")}>
            <PanelHeader
              badge={`${needsPtCount} cần PT`}
              icon={<Users aria-hidden="true" className="size-4" />}
              title="Hội viên chờ phân công"
            />

            <div className="space-y-3 border-b border-border p-4">
              <SearchInput
                dataTestId="assignment-member-search"
                onChange={setMemberQuery}
                placeholder="Tìm hội viên..."
                value={memberQuery}
              />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
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

          <section className={cn(cardClass, "flex min-h-[640px] flex-col overflow-hidden")}>
            <PanelHeader
              action={
                <Button
                  className="rounded-full text-primary hover:bg-primary/10"
                  type="button"
                  variant="ghost"
                >
                  <Filter aria-hidden="true" className="size-4" />
                  Lọc
                </Button>
              }
              badge={`${trainers.length} PT`}
              icon={<Dumbbell aria-hidden="true" className="size-4" />}
              title="PT khả dụng"
            />

            <div className="space-y-3 border-b border-border p-4">
              <SearchInput
                dataTestId="assignment-trainer-search"
                onChange={setTrainerQuery}
                placeholder="Tìm PT..."
                value={trainerQuery}
              />

              <div className="flex flex-wrap gap-2">
                {["all", "Weight Loss", "Strength", "Cardio", "Mobility"].map((item) => (
                  <button
                    className={cn(
                      "min-h-9 rounded-full border px-4 text-sm font-semibold transition active:scale-[0.98]",
                      specialty === item
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-[var(--surface-panel)] text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    key={item}
                    onClick={() => setSpecialty(item)}
                    type="button"
                  >
                    {item === "all" ? "Tất cả" : displaySpecialty(item)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
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

          <section className={cn(cardClass, "flex min-h-[640px] flex-col overflow-hidden")}>
            <PanelHeader
              icon={<Handshake aria-hidden="true" className="size-4" />}
              title="Xem trước phân công"
            />

            <div className="flex-1 overflow-y-auto">
              <AssignmentPreview
                assignmentError={assignmentError}
                mode={mode}
                result={result}
                selectedMember={selectedMember}
                selectedTrainer={selectedTrainer}
              />
            </div>

            <div className="border-t border-border p-4">
              <Button
                className="min-h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:brightness-95 active:scale-[0.98]"
                data-testid="assignment-confirm-button"
                disabled={!canConfirm || assignTrainer.isPending}
                onClick={onConfirm}
                type="button"
              >
                <CheckCircle2 aria-hidden="true" className="size-5" />
                {mode === "reassign" ? "Gửi yêu cầu phân công" : "Xác nhận phân công"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

function MetricCard({
  helper,
  icon,
  label,
  tone,
  value,
}: {
  helper: string
  icon: React.ReactNode
  label: string
  tone: "primary" | "success" | "neutral"
  value: string
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
    neutral: "bg-muted text-muted-foreground",
  }[tone]

  return (
    <div className="gm-panel relative overflow-hidden p-5">
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/5" />
      <div className="relative flex items-center gap-4">
        <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-full", toneClass)}>
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-primary">{helper}</p>
        </div>
      </div>
    </div>
  )
}

function SearchInput({
  dataTestId,
  onChange,
  placeholder,
  value,
}: {
  dataTestId: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        className="gm-field min-h-11 w-full pl-11 pr-3 text-sm text-foreground transition placeholder:text-muted-foreground"
        data-testid={dataTestId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
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
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        {badge ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {badge}
          </span>
        ) : null}
        {action}
      </div>
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
        "gm-interactive-card group flex w-full items-start gap-3 p-4 text-left active:scale-[0.99]",
        selected
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : "",
      )}
      data-testid="assignment-member-card"
      onClick={onSelect}
      type="button"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
        {initials(member.fullName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {member.fullName}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {member.email}
        </span>
        <span className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {member.memberCode}
          </span>
          {member.currentTrainerName ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              PT hiện tại: {member.currentTrainerName}
            </span>
          ) : (
            <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
              Cần PT
            </span>
          )}
        </span>
      </span>
      <span className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary">
        ›
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
        "gm-interactive-card relative w-full p-4 text-left active:scale-[0.99]",
        selected
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : "",
      )}
      data-testid="assignment-trainer-card"
      onClick={onSelect}
      type="button"
    >
      {selected ? (
        <span className="absolute right-0 top-0 rounded-bl-xl rounded-tr-xl bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
          Đang chọn
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {initials(trainer.fullName)}
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">
              {trainer.fullName}
            </span>
            <span className="block text-xs text-muted-foreground">
              Chuyên môn: {displaySpecialty(trainer.specialty)}
            </span>
          </span>
        </div>
        <StatusPill status={trainer.status === "locked" ? "locked" : "active"} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs font-medium">
          <span className="text-muted-foreground">Tải hiện tại</span>
          <span className={percent >= 90 ? "text-destructive" : "text-primary"}>
            {nextCapacity}/{trainer.capacity} suất
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className={cn(
              "h-2 rounded-full",
              percent >= 90 ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <span
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold",
            selected
              ? "bg-primary text-primary-foreground"
              : "border border-border/80 bg-[var(--surface-panel)] text-foreground",
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
    <div className="flex flex-1 flex-col overflow-y-auto p-5">
      <div className="space-y-4">
        <PreviewBlock
          empty="Chọn hội viên"
          name={selectedMember?.fullName}
          subline={selectedMember ? `${selectedMember.memberCode} · ${selectedMember.currentTrainerName ? "Đã có PT" : "Chưa có PT"}` : undefined}
        />

        <div className="flex justify-center text-primary">
          <div className="flex flex-col items-center">
            <div className="h-8 border-l-2 border-dashed border-primary/30" />
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <CheckCircle2 aria-hidden="true" className="size-5" />
            </span>
            <div className="h-8 border-l-2 border-dashed border-primary/30" />
          </div>
        </div>

        <PreviewBlock
          empty="Chọn PT"
          label={
            selectedTrainer
              ? `Chuyên môn: ${displaySpecialty(selectedTrainer.specialty)}`
              : undefined
          }
          name={selectedTrainer?.fullName}
          subline={
            selectedTrainer
              ? `${selectedTrainer.assignedCount + 1}/${selectedTrainer.capacity} ca sau phân công`
              : undefined
          }
        />

        {selectedMember && selectedTrainer ? (
          <section className="gm-panel-muted p-4">
            <p className="text-sm font-semibold text-foreground">Tóm tắt phân công</p>
            <div className="mt-3 space-y-2 text-sm">
              <PreviewRow label="Hình thức" value={mode === "reassign" ? "Phân công lại" : "Phân công mới"} />
              <PreviewRow
                label="Trạng thái hội viên"
                value={
                  selectedMember.membershipStatus === "active"
                    ? "Đang hoạt động"
                    : selectedMember.membershipStatus === "expired"
                      ? "Hết hạn"
                      : "Chờ kích hoạt"
                }
              />
              <PreviewRow
                label="Tải PT sau phân công"
                value={`${selectedTrainer.assignedCount + 1}/${selectedTrainer.capacity} suất`}
              />
            </div>

            {mode === "reassign" && selectedMember.currentTrainerName ? (
              <p className="mt-3 rounded-[1rem] border border-[var(--status-warning)]/25 bg-[var(--status-warning)]/10 p-3 text-xs leading-5 text-[var(--status-warning)]">
                Hội viên đang được {selectedMember.currentTrainerName} phụ trách. Cần
                kết thúc phân công hiện tại trước khi gán PT mới.
              </p>
            ) : null}
          </section>
        ) : null}
      </div>

      {assignmentError ? (
        <div
          className="mt-4 rounded-[1.25rem] border border-destructive/20 bg-destructive/10 p-3 text-destructive"
          data-testid="assignment-error"
        >
          <p className="text-sm font-semibold">Không thể phân công PT</p>
          <p className="mt-1 text-xs font-medium">{assignmentError}</p>
        </div>
      ) : null}

      {result ? (
        <div
          className="mt-4 rounded-[1.25rem] border border-primary/20 bg-primary/10 p-3"
          data-testid="assignment-success"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {result.message}
          </div>
          <p className="mt-1 text-xs font-medium text-primary">
            Audit Log #{result.auditLogId} · ASSIGN_PT
          </p>
          {result.previousAssignment ? (
            <p className="mt-1 text-xs text-primary">
              Phân công cũ #{result.previousAssignment.id} đã kết thúc.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function PreviewBlock({
  empty,
  label,
  name,
  subline,
}: {
  empty: string
  label?: string
  name?: string
  subline?: string
}) {
  return (
    <div className="gm-panel-muted p-4 text-center">
      <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
        {name ? initials(name) : <UserRound aria-hidden="true" className="size-6" />}
      </div>
      <h4 className="font-semibold text-foreground">{name ?? empty}</h4>
      {subline ? (
        <p className="mt-1 text-xs text-muted-foreground">{subline}</p>
      ) : null}
      {label ? (
        <span className="mt-3 inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
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
