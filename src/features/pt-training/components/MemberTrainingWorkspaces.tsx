"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  MessageSquareText,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react"
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
  const plans = plansQuery.data ?? []
  const latestPlan = plans[0]
  const exercisesCount = latestPlan?.exercises.length ?? 0

  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Xem giáo án luyện tập do PT phụ trách tạo cho bạn."
        role="member"
        title="Giáo án của tôi"
      >
        <section className="space-y-6">
          <MemberTrainingHero
            ctaHref="/member/trainer-notes"
            ctaLabel="Xem ghi chú PT"
            description="Theo dõi bài tập, số hiệp, reps và cue kỹ thuật từ PT trong một layout dễ tập theo."
            eyebrow="Training Plan Viewer"
            icon={ShieldCheck}
            stats={[
              { label: "Tuần", value: "04" },
              { label: "Mục tiêu", value: "Tăng cơ" },
              { label: "Bài tập", value: String(exercisesCount || 2) },
            ]}
            title="Giáo án hôm nay, rõ từng bài và cue kỹ thuật."
          />

          <section className="grid gap-4 md:grid-cols-3">
            <TrainingMetric
              icon={ClipboardList}
              label="Plan hiện tại"
              value={latestPlan?.title ?? "Foundation Strength"}
            />
            <TrainingMetric
              icon={Dumbbell}
              label="Khối lượng"
              value={`${exercisesCount || 2} bài tập`}
            />
            <TrainingMetric
              icon={CheckCircle2}
              label="Trạng thái"
              value={latestPlan?.status ?? "Active"}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="space-y-4">
              <WorkoutPlanListHeader />
              <WorkoutPlanList
                error={plansQuery.error instanceof Error ? plansQuery.error : null}
                isLoading={plansQuery.isLoading}
                mediaMode="member"
                plans={plansQuery.data}
              />
            </main>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <MemberSideCard
                description="Đọc ghi chú mới nhất để biết lỗi kỹ thuật cần sửa trong buổi tới."
                href="/member/trainer-notes"
                icon={NotebookPen}
                title="Cue từ PT"
              />
              <MemberSideCard
                description="Giữ lịch tập ổn định và cập nhật dinh dưỡng sau mỗi buổi."
                href="/member/nutrition/meal-journal"
                icon={Target}
                title="Dinh dưỡng hỗ trợ"
              />
            </aside>
          </section>
        </section>
      </WorkspaceShell>
    </PermissionGuard>
  )
}

export function MemberTrainerNotesWorkspace() {
  const notesQuery = useMemberTrainerNotes(demoMemberId)
  const notesCount = notesQuery.data?.length ?? 0

  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Xem phản hồi huấn luyện từ PT phụ trách."
        role="member"
        title="Ghi chú PT"
      >
        <section className="space-y-6">
          <MemberTrainingHero
            ctaHref="/member/workout"
            ctaLabel="Mở giáo án"
            description="Các ghi chú được PT tạo sau đánh giá, buổi tập hoặc trao đổi phục hồi."
            eyebrow="Coach Feedback"
            icon={NotebookPen}
            stats={[
              { label: "Tuần", value: "04" },
              { label: "Ghi chú", value: String(notesCount || 1) },
              { label: "Ưu tiên", value: "Kỹ thuật" },
            ]}
            title="Phản hồi huấn luyện để tập đúng hơn."
          />

          <section className="grid gap-4 md:grid-cols-3">
            <TrainingMetric
              icon={MessageSquareText}
              label="Ghi chú mới"
              value={String(notesCount || 1)}
            />
            <TrainingMetric
              icon={Sparkles}
              label="Trọng tâm"
              value="Shoulder warm-up"
            />
            <TrainingMetric
              icon={CalendarDays}
              label="Buổi tới"
              value="18:30"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="space-y-4">
              <TrainerNoteListHeader />
              <TrainerNoteList
                error={notesQuery.error instanceof Error ? notesQuery.error : null}
                isLoading={notesQuery.isLoading}
                notes={notesQuery.data}
                variant="member"
              />
            </main>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <MemberSideCard
                description="Áp dụng cue trong từng set, đặc biệt ở các bài compound."
                href="/member/workout"
                icon={Dumbbell}
                title="Liên kết với giáo án"
              />
              <MemberSideCard
                description="Ghi bữa ăn sau buổi tập để giữ đúng mục tiêu calo."
                href="/member/nutrition/meal-journal"
                icon={Target}
                title="Theo dõi phục hồi"
              />
            </aside>
          </section>
        </section>
      </WorkspaceShell>
    </PermissionGuard>
  )
}

function MemberTrainingHero({
  ctaHref,
  ctaLabel,
  description,
  eyebrow,
  icon: Icon,
  stats,
  title,
}: {
  ctaHref: string
  ctaLabel: string
  description: string
  eyebrow: string
  icon: LucideIcon
  stats: { label: string; value: string }[]
  title: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
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

          <h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {description}
          </p>

          <div className="mt-6">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
              href={ctaHref}
            >
              {ctaLabel}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {stats.map((stat) => (
            <HeroStat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TrainingMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </section>
  )
}

function MemberSideCard({
  description,
  href,
  icon: Icon,
  title,
}: {
  description: string
  href: string
  icon: LucideIcon
  title: string
}) {
  return (
    <Link
      className="group block rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
      href={href}
    >
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            {description}
          </span>
        </span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Mở workspace
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}
