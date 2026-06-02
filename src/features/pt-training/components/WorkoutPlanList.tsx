"use client"

import { ClipboardList } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import type { WorkoutPlan } from "@/features/pt-training/types/pt-training.types"

type WorkoutPlanListProps = {
  error?: Error | null
  isLoading?: boolean
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
    <div className="space-y-4">
      {plans.map((plan) => (
        <article
          className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          key={plan.id}
        >
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

          <div className="mt-5 space-y-3">
            {plan.exercises.map((exercise, index) => (
              <div
                className="grid gap-3 rounded-xl border border-border bg-background p-3 text-sm sm:grid-cols-[1fr_auto_auto]"
                key={`${plan.id}-${exercise.orderIndex}-${exercise.name}`}
              >
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
                <p className="font-semibold text-foreground">
                  {exercise.sets} hiệp
                </p>
                <p className="font-semibold text-foreground">
                  {exercise.reps} reps
                </p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
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
