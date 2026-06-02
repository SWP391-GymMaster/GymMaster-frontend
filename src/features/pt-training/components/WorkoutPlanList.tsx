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
  if (!value) return "No start date"

  return new Intl.DateTimeFormat("en", {
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
            className="h-40 animate-pulse rounded-xl border border-[#c2c6d6] bg-white"
            key={index}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <StateBlock
        description="Refresh the workspace and confirm this member is assigned to you."
        title={error.message}
        tone="error"
      />
    )
  }

  if (!plans?.length) {
    return (
      <StateBlock
        description="Create a plan with at least one exercise to publish coaching guidance."
        title="No workout plans yet"
        tone="empty"
      />
    )
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <article
          className="rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg"
          key={plan.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#595e6d]">
                {formatDate(plan.startDate ?? plan.createdAt)}
              </p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-[#191b23]">
                {plan.title}
              </h3>
            </div>
            <span className="rounded-full bg-[#d8e2ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#004395]">
              {plan.status ?? "active"}
            </span>
          </div>

          <div className="mt-5 space-y-2">
            {plan.exercises.map((exercise, index) => (
              <div
                className="grid gap-3 rounded-lg border border-[#e1e2ec] bg-[#f9f9ff] p-3 text-sm sm:grid-cols-[1fr_auto_auto]"
                key={`${plan.id}-${exercise.orderIndex}-${exercise.name}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#2170e4] text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-[#191b23]">{exercise.name}</p>
                    {exercise.note ? (
                      <p className="mt-1 text-xs text-[#595e6d]">
                        {exercise.note}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="font-semibold text-[#424754]">
                  {exercise.sets} sets
                </p>
                <p className="font-semibold text-[#424754]">
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
      <ClipboardList aria-hidden="true" className="size-5 text-[#0058be]" />
      <h2 className="text-lg font-black tracking-tight text-[#191b23]">
        Workout plans
      </h2>
    </div>
  )
}
