"use client"

import { NotebookPen, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import {
  useMemberTrainerNotes,
  useMemberWorkoutPlans,
} from "@/features/pt-training/api/pt-training.queries"
import {
  TrainerNoteList,
  TrainerNoteListHeader,
} from "@/features/pt-training/components/TrainerNoteList"
import {
  WorkoutPlanList,
  WorkoutPlanListHeader,
} from "@/features/pt-training/components/WorkoutPlanList"

const demoMemberId = 101

export function MemberWorkoutWorkspace() {
  const plansQuery = useMemberWorkoutPlans(demoMemberId)

  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Xem giáo án luyện tập do PT phụ trách tạo cho bạn."
        role="member"
        title="Giáo án của tôi"
      >
        <section className="space-y-5">
          <MemberTrainingHero
            description="Theo dõi giáo án hiện tại, bài tập từng buổi và cue kỹ thuật do PT phụ trách cập nhật."
            eyebrow="Chế độ xem hội viên"
            icon={ShieldCheck}
            title="Theo sát giáo án hiện tại"
          />
          <WorkoutPlanListHeader />
          <WorkoutPlanList
            error={plansQuery.error instanceof Error ? plansQuery.error : null}
            isLoading={plansQuery.isLoading}
            plans={plansQuery.data}
          />
        </section>
      </WorkspaceShell>
    </PermissionGuard>
  )
}

export function MemberTrainerNotesWorkspace() {
  const notesQuery = useMemberTrainerNotes(demoMemberId)

  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Xem phản hồi huấn luyện từ PT phụ trách."
        role="member"
        title="Ghi chú PT"
      >
        <section className="space-y-5">
          <MemberTrainingHero
            description="Ghi chú được PT tạo sau đánh giá, buổi tập hoặc trao đổi phục hồi."
            eyebrow="Chế độ xem hội viên"
            icon={NotebookPen}
            title="Phản hồi huấn luyện"
          />
          <TrainerNoteListHeader />
          <TrainerNoteList
            error={notesQuery.error instanceof Error ? notesQuery.error : null}
            isLoading={notesQuery.isLoading}
            notes={notesQuery.data}
          />
        </section>
      </WorkspaceShell>
    </PermissionGuard>
  )
}

function MemberTrainingHero({
  description,
  eyebrow,
  icon: Icon,
  title,
}: {
  description: string
  eyebrow: string
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
            <StatusPill
              className="border-primary/20 bg-primary/10 text-primary"
              label="PT phụ trách"
              status="assigned"
            />
          </div>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-64">
          <HeroStat label="Tuần" value="04" />
          <HeroStat label="Mục tiêu" value="Tăng cơ" />
        </div>
      </div>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
