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
  "rounded-xl border border-[#c2c6d6] bg-white shadow-[0_4px_24px_rgba(25,27,35,0.04)]"

export function AdminPtAssignmentWorkspace() {
  const [memberQuery, setMemberQuery] = useState("")
  const [trainerQuery, setTrainerQuery] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null)
  const [result, setResult] = useState<AssignTrainerResult | null>(null)
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
      toast.error("Select one member and one trainer before confirming.")
      return
    }

    try {
      const nextResult = await assignTrainer.mutateAsync({
        memberId: selectedMember.id,
        trainerId: selectedTrainer.id,
      })
      setResult(nextResult)
      toast.success(nextResult.message)
    } catch (error) {
      const mapped = mapPtAssignmentError(error)
      toast.error(mapped.message)
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#191b23]">
            PT Assignment
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#595e6d]">
            Pair members with trainers, enforce active ownership, and write
            audit evidence.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <MetricPill label="Needs PT" value={String(needsPtCount)} tone="danger" />
          <MetricPill label="Trainers" value={String(trainers.length)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className={cn(cardClass, "flex min-h-[620px] flex-col p-5 lg:col-span-4")}>
          <PanelHeader
            badge={`${needsPtCount} Needs PT`}
            icon={<Users aria-hidden="true" className="size-4" />}
            title="Unassigned Members"
          />
          <label className="relative mb-4">
            <span className="sr-only">Filter members</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
            />
            <input
              className="min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-[#f9f9ff] pl-10 pr-3 text-sm outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/15"
              data-testid="assignment-member-search"
              onChange={(event) => setMemberQuery(event.target.value)}
              placeholder="Filter members..."
              value={memberQuery}
            />
          </label>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <AssignmentQueryState
              emptyTitle="No members available"
              error={membersQuery.error}
              isLoading={membersQuery.isLoading}
              itemCount={members.length}
              loadingTitle="Loading assignment members..."
            />
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onSelect={() => {
                  setSelectedMemberId(member.id)
                  setResult(null)
                }}
                selected={selectedMemberId === member.id}
              />
            ))}
          </div>
        </section>

        <section className={cn(cardClass, "flex min-h-[620px] flex-col p-5 lg:col-span-5")}>
          <PanelHeader
            action={
              <Button className="rounded-lg text-[#0058be]" type="button" variant="ghost">
                <Filter aria-hidden="true" className="size-4" />
                Filter
              </Button>
            }
            icon={<Dumbbell aria-hidden="true" className="size-4" />}
            title="Available Trainers"
          />
          <label className="relative mb-3">
            <span className="sr-only">Filter trainers</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
            />
            <input
              className="min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-[#f9f9ff] pl-10 pr-3 text-sm outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/15"
              data-testid="assignment-trainer-search"
              onChange={(event) => setTrainerQuery(event.target.value)}
              placeholder="Filter trainers..."
              value={trainerQuery}
            />
          </label>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {["all", "Weight Loss", "Strength"].map((item) => (
              <button
                className={cn(
                  "min-h-9 rounded-full border px-3 text-sm font-bold transition active:scale-[0.98]",
                  specialty === item
                    ? "border-[#0058be] bg-[#0058be]/10 text-[#0058be]"
                    : "border-[#c2c6d6] bg-white text-[#595e6d] hover:bg-[#f2f3fd]",
                )}
                key={item}
                onClick={() => setSpecialty(item)}
                type="button"
              >
                {item === "all" ? "All Specialties" : item}
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <AssignmentQueryState
              emptyTitle="No trainers available"
              error={trainersQuery.error}
              isLoading={trainersQuery.isLoading}
              itemCount={trainers.length}
              loadingTitle="Loading available trainers..."
            />
            {trainers.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                onSelect={() => {
                  setSelectedTrainerId(trainer.id)
                  setResult(null)
                }}
                selected={selectedTrainerId === trainer.id}
                trainer={trainer}
              />
            ))}
          </div>
        </section>

        <section className={cn(cardClass, "flex min-h-[620px] flex-col bg-[#f9f9ff] p-5 lg:col-span-3")}>
          <PanelHeader
            icon={<Handshake aria-hidden="true" className="size-4" />}
            title="Preview"
          />
          <AssignmentPreview
            mode={mode}
            result={result}
            selectedMember={selectedMember}
            selectedTrainer={selectedTrainer}
          />
          <Button
            className="mt-auto min-h-14 rounded-xl bg-[#0058be] text-white hover:bg-[#2170e4] active:scale-[0.98]"
            data-testid="assignment-confirm-button"
            disabled={!canConfirm || assignTrainer.isPending}
            onClick={onConfirm}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" className="size-5" />
            {mode === "reassign" ? "Confirm Reassignment" : "Confirm Assignment"}
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
          ? "border-[#f4c7c3] bg-[#ffedea] text-[#ba1a1a]"
          : "border-[#c2c6d6] bg-white text-[#191b23]",
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
    <header className="mb-4 flex items-center justify-between gap-3 border-b border-[#c2c6d6] pb-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#d8e2ff] text-[#0058be]">
          {icon}
        </span>
        <h3 className="text-xs font-black uppercase tracking-[0.1em] text-[#191b23]">
          {title}
        </h3>
      </div>
      {badge ? (
        <span className="rounded-full bg-[#ffedea] px-2 py-1 text-xs font-bold text-[#ba1a1a]">
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
          ? "border-[#0058be] bg-[#0058be]/5"
          : "border-[#c2c6d6] bg-white hover:bg-[#f9f9ff]",
      )}
      data-testid="assignment-member-card"
      onClick={onSelect}
      type="button"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#c2c6d6] bg-[#dbdff1] font-black text-[#5d6272]">
        {initials(member.fullName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#191b23]">
          {member.fullName}
        </span>
        <span className="mt-1 block text-xs text-[#595e6d]">
          Goal: {member.goal ?? "General fitness"}
        </span>
        <span className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-sm bg-[#f2f3fd] px-2 py-1 text-[10px] font-bold text-[#595e6d]">
            {member.memberCode}
          </span>
          {member.currentTrainerName ? (
            <span className="rounded-sm bg-[#d8e2ff] px-2 py-1 text-[10px] font-bold text-[#0058be]">
              Current: {member.currentTrainerName}
            </span>
          ) : (
            <span className="rounded-sm bg-[#ffedea] px-2 py-1 text-[10px] font-bold text-[#ba1a1a]">
              Needs PT
            </span>
          )}
          {member.priority === "high" ? (
            <span className="rounded-sm bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
              High Priority
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
          ? "border-2 border-[#0058be] bg-[#0058be]/5"
          : "border-[#c2c6d6] bg-white hover:bg-[#f9f9ff]",
      )}
      data-testid="assignment-trainer-card"
      onClick={onSelect}
      type="button"
    >
      {selected ? (
        <span className="absolute right-0 top-0 rounded-bl-lg bg-[#0058be] px-2 py-1 text-[10px] font-bold text-white">
          Previewing
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full border border-[#c2c6d6] bg-[#dbdff1] font-black text-[#5d6272]">
            {initials(trainer.fullName)}
          </span>
          <span>
            <span className="block text-sm font-bold text-[#191b23]">
              {trainer.fullName}
            </span>
            <span className="block text-xs text-[#595e6d]">
              Specialty: {trainer.specialty}
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
            <span className="text-[#595e6d]">Capacity</span>
            <span className={percent >= 90 ? "text-[#ba1a1a]" : "text-emerald-700"}>
              {nextCapacity}/{trainer.capacity} Slots
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#dbdff1]">
            <div
              className={cn(
                "h-1.5 rounded-full",
                percent >= 90 ? "bg-[#ba1a1a]" : "bg-[#0058be]",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <span
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-bold",
            selected
              ? "bg-[#0058be] text-white"
              : "border border-[#c2c6d6] text-[#191b23]",
          )}
        >
          {selected ? "Selected" : "Select"}
        </span>
      </div>
    </button>
  )
}

function AssignmentPreview({
  mode,
  result,
  selectedMember,
  selectedTrainer,
}: {
  mode: "assign" | "reassign"
  result: AssignTrainerResult | null
  selectedMember: AssignmentCandidateMember | null
  selectedTrainer: AssignmentCandidateTrainer | null
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-5">
      <PreviewIdentity
        empty="Select a member"
        label={selectedMember?.goal ? `Goal: ${selectedMember.goal}` : undefined}
        name={selectedMember?.fullName}
      />
      <div className="flex flex-col items-center py-5 text-[#0058be]">
        <div className="h-8 border-l-2 border-dashed border-[#0058be]/40" />
        <span className="rounded-full bg-[#0058be]/10 p-3">
          <Handshake aria-hidden="true" className="size-5" />
        </span>
        <div className="h-8 border-l-2 border-dashed border-[#0058be]/40" />
      </div>
      <div className="rounded-xl border border-[#c2c6d6] bg-white p-4">
        <PreviewIdentity
          empty="Select a trainer"
          label={
            selectedTrainer
              ? `Expert in ${selectedTrainer.specialty}`
              : undefined
          }
          name={selectedTrainer?.fullName}
        />
        {selectedMember && selectedTrainer ? (
          <div className="mt-4 rounded-md border border-[#e1e2ec] bg-[#f9f9ff] p-3">
            <p className="mb-2 text-xs font-bold text-[#595e6d]">
              {mode === "reassign" ? "Change PT preview" : "New assignment preview"}
            </p>
            <div className="flex items-center justify-between text-sm font-bold text-[#191b23]">
              <span>Slots Filled</span>
              <span className="text-[#0058be]">
                {selectedTrainer.assignedCount + 1} / {selectedTrainer.capacity}
              </span>
            </div>
            {mode === "reassign" && selectedMember.currentTrainerName ? (
              <p className="mt-2 text-xs text-[#595e6d]">
                Replaces {selectedMember.currentTrainerName}; previous assignment
                will be ended.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {result ? (
        <div
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3"
          data-testid="assignment-success"
        >
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {result.message}
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-800">
            Audit Log #{result.auditLogId} · ASSIGN_PT
          </p>
          {result.previousAssignment ? (
            <p className="mt-1 text-xs text-emerald-800">
              Previous assignment #{result.previousAssignment.id} ended.
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
      <div className="mb-2 flex size-16 items-center justify-center rounded-full border-4 border-white bg-[#0058be] text-lg font-black text-white shadow-sm">
        {name ? initials(name) : <UserRound aria-hidden="true" className="size-6" />}
      </div>
      <h4 className="font-bold text-[#191b23]">{name ?? empty}</h4>
      {label ? (
        <span className="mt-1 rounded-sm bg-[#f2f3fd] px-2 py-1 text-[10px] font-bold text-[#595e6d]">
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
        description="Loading assignment data from the PT ownership contract."
        title={loadingTitle}
        tone="loading"
      />
    )
  }

  if (error) {
    const mapped = mapPtAssignmentError(error)
    return (
      <StateBlock
        description="Try again or verify Admin permissions."
        title={mapped.message}
        tone="error"
      />
    )
  }

  if (itemCount === 0) {
    return (
      <StateBlock
        description="Adjust filters or create the missing management record first."
        title={emptyTitle}
        tone="empty"
      />
    )
  }

  return null
}
