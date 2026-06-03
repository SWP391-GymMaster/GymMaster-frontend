"use client"

import {
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  MoreVertical,
  Trash2,
} from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  getWorkoutAssetForExercise,
  getWorkoutCategoryLabel,
} from "@/features/pt-training/data/workout-assets"
import type { WorkoutPlan } from "@/features/pt-training/types/pt-training.types"
import { cn } from "@/lib/utils"

type WorkoutPlanListProps = {
  error?: Error | null
  isLoading?: boolean
  mediaMode?: "none" | "member" | "coach"
  plans?: WorkoutPlan[]
}

function formatDate(value?: string) {
  if (!value) return "Chưa có ngày bắt đầu"

  return new Intl.DateTimeFormat("vi-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export function WorkoutPlanList({
  error,
  isLoading,
  mediaMode = "none",
  plans,
}: WorkoutPlanListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="workout-plan-loading">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            className="h-40 animate-pulse rounded-2xl border border-border bg-card"
            key={index}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <StateBlock
        description="Tải lại workspace và kiểm tra hội viên này có thuộc danh sách của bạn."
        title={error.message}
        tone="error"
      />
    )
  }

  if (!plans?.length) {
    return (
      <StateBlock
        description="Tạo giáo án với ít nhất một bài tập để hội viên có hướng dẫn luyện tập."
        title="Chưa có giáo án"
        tone="empty"
      />
    )
  }

  return (
    <div className="space-y-5">
      {plans.map((plan, planIndex) =>
        mediaMode === "coach" ? (
          <CoachWorkoutPlanCard key={plan.id} plan={plan} planIndex={planIndex} />
        ) : (
          <DefaultWorkoutPlanCard
            key={plan.id}
            mediaMode={mediaMode}
            plan={plan}
          />
        ),
      )}
    </div>
  )
}

function CoachWorkoutPlanCard({
  plan,
  planIndex,
}: {
  plan: WorkoutPlan
  planIndex: number
}) {
  const isFirstPlan = planIndex === 0

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {isFirstPlan ? `Buổi tập 1: ${plan.title}` : plan.title}
            </h3>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {plan.exercises.length} bài tập
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(plan.startDate ?? plan.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="size-10 rounded-xl border-border bg-card text-foreground hover:bg-muted"
            type="button"
            variant="outline"
          >
            <MoreVertical aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {plan.exercises.map((exercise, index) => (
          <CoachExerciseRow
            exercise={exercise}
            index={index}
            key={`${plan.id}-${exercise.orderIndex}-${exercise.name}`}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/60 p-4">
        <Button
          className="rounded-xl border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 active:scale-[0.98]"
          type="button"
          variant="outline"
        >
          Thêm bài tập
        </Button>
        <div className="flex flex-wrap gap-6 text-sm">
          <SummaryItem label="Tổng cộng" value={`${plan.exercises.length} bài`} />
          <SummaryItem label="Thời lượng ước tính" value="~ 75 phút" />
          <SummaryItem label="Tần suất" value="4 buổi/tuần" />
        </div>
      </div>
    </article>
  )
}

function CoachExerciseRow({
  exercise,
  index,
}: {
  exercise: WorkoutPlan["exercises"][number]
  index: number
}) {
  const asset = getWorkoutAssetForExercise(exercise.name)

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[24px_96px_minmax(0,1fr)_86px_96px_84px_92px_auto] lg:items-center">
      <div className="hidden cursor-grab text-muted-foreground lg:block">::</div>

      <div className="relative h-16 overflow-hidden rounded-lg border border-border bg-muted">
        <img
          alt={`Minh họa bài tập ${exercise.name}`}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          src={asset.src}
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{exercise.name}</p>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {getWorkoutCategoryLabel(asset.category)}
          </span>
        </div>
        {exercise.note ? (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {exercise.note}
          </p>
        ) : null}
      </div>

      <CoachInlineField label="Sets" value={String(exercise.sets)} />
      <CoachInlineField label="Reps" value={exercise.reps} />
      <CoachInlineField label="RPE" value="7-8" />
      <CoachInlineField label="Nghỉ" value="90s" />

      <div className="flex items-center gap-2">
        <Button
          className="size-9 rounded-xl border-border bg-card text-foreground hover:bg-muted"
          type="button"
          variant="outline"
        >
          <Copy aria-hidden="true" className="size-4" />
        </Button>
        <Button
          className="size-9 rounded-xl border-destructive/20 bg-card text-destructive hover:bg-destructive/10"
          type="button"
          variant="outline"
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function CoachInlineField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        className="min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
        readOnly
        value={value}
      />
    </label>
  )
}

function DefaultWorkoutPlanCard({
  mediaMode,
  plan,
}: {
  mediaMode: "none" | "member"
  plan: WorkoutPlan
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="border-b border-border bg-primary/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {formatDate(plan.startDate ?? plan.createdAt)}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {plan.title}
            </h3>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-primary">
            {plan.status ?? "active"}
          </span>
        </div>

        {mediaMode === "member" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <PlanStat label="Số bài" value={`${plan.exercises.length}`} />
            <PlanStat label="Trọng tâm" value="Strength" />
            <PlanStat label="Theo dõi" value="Cue kỹ thuật" />
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "p-5",
          mediaMode === "member" ? "grid gap-4" : "space-y-3",
        )}
      >
        {plan.exercises.map((exercise, index) => (
          <ExerciseRow
            exercise={exercise}
            index={index}
            key={`${plan.id}-${exercise.orderIndex}-${exercise.name}`}
            mediaMode={mediaMode}
          />
        ))}
      </div>
    </article>
  )
}

function ExerciseRow({
  exercise,
  index,
  mediaMode,
}: {
  exercise: WorkoutPlan["exercises"][number]
  index: number
  mediaMode: "none" | "member"
}) {
  const asset = getWorkoutAssetForExercise(exercise.name)

  if (mediaMode === "member") {
    return (
      <div className="grid gap-4 rounded-2xl border border-border bg-background p-3 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="relative min-h-36 overflow-hidden rounded-xl border border-border bg-muted">
          <img
            alt={`Minh họa bài tập ${exercise.name}`}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            src={asset.src}
          />
          <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
            {getWorkoutCategoryLabel(asset.category)}
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4 p-1">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {exercise.name}
                  </p>
                  {exercise.note ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {exercise.note}
                    </p>
                  ) : null}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
                Sẵn sàng
              </span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <ExerciseStat label="Sets" value={`${exercise.sets}`} />
            <ExerciseStat label="Reps" value={exercise.reps} />
            <ExerciseStat label="Cue" value={exercise.note ? "Có" : "Chưa có"} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-background p-3 text-sm sm:grid-cols-[1fr_auto_auto]">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index + 1}
        </span>
        <div>
          <p className="font-semibold text-foreground">{exercise.name}</p>
          {exercise.note ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {exercise.note}
            </p>
          ) : null}
        </div>
      </div>
      <p className="font-semibold text-foreground">{exercise.sets} hiệp</p>
      <p className="font-semibold text-foreground">{exercise.reps} reps</p>
    </div>
  )
}

function PlanStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl border border-border bg-card p-3">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="mt-1 block text-sm font-semibold text-foreground">
        {value}
      </span>
    </span>
  )
}

function ExerciseStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl border border-border bg-card px-3 py-2">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="mt-0.5 block text-sm font-semibold text-foreground">
        {value}
      </span>
    </span>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="mt-0.5 block font-semibold text-foreground">{value}</span>
    </span>
  )
}

export function WorkoutPlanListHeader() {
  return (
    <div className="flex items-center gap-2">
      <ClipboardList aria-hidden="true" className="size-5 text-primary" />
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Giáo án luyện tập
      </h2>
    </div>
  )
}
