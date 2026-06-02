"use client"

import Link from "next/link"
import { CalendarCheck, Dumbbell, Salad, TrendingUp } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { Button } from "@/components/ui/button"
import { NutritionSummaryCard } from "@/features/member-nutrition/components/NutritionSummaryCard"
import { useMemberCalorieSummary } from "@/features/member-nutrition/api/member-nutrition.queries"
import { getTodayDate } from "@/features/member-nutrition/utils/nutrition-formatters"

const today = getTodayDate()

const actionCards = [
  {
    href: "/member/nutrition/meal-journal",
    title: "Log a meal",
    description: "Add food, quantity, and meal type for today's journal.",
    icon: Salad,
  },
  {
    href: "/member/nutrition/summary",
    title: "Review calories",
    description: "Check consumed, target, remaining, and macro readiness.",
    icon: TrendingUp,
  },
]

const supportCards = [
  {
    title: "Membership",
    description: "Premium 30 is active through Jun 30.",
    icon: CalendarCheck,
  },
  {
    title: "Workout",
    description: "Coach plan and trainer notes are coming in the next MVP slice.",
    icon: Dumbbell,
  },
]

export function MemberDashboardContent() {
  const summary = useMemberCalorieSummary(today)

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
              Member command center
            </p>
            <StatusPill
              className="border-white/10 bg-white/10 text-white"
              label="Active membership"
              status="active"
            />
          </div>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
            Keep training and nutrition in one daily rhythm.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            Track today&apos;s meals, watch remaining calories, and keep the next
            workout context close without leaving the Member workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="default">
              <Link href="/member/nutrition/meal-journal">Add meal</Link>
            </Button>
            <Button
              asChild
              
              variant="outline"
            >
              <Link href="/member/nutrition/summary">View summary</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {actionCards.map((action) => {
            const Icon = action.icon

            return (
              <Link
                className="group flex min-h-28 items-center gap-4 rounded-[1.25rem] border border-white/70 bg-white/85 p-4 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
                href={action.href}
                key={action.href}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-800">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span>
                  <span className="block text-base font-semibold text-zinc-950">
                    {action.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-zinc-600">
                    {action.description}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <NutritionSummaryCard
          isError={summary.isError}
          isLoading={summary.isLoading}
          summary={summary.data}
        />
        <div className="grid gap-3">
          {supportCards.map((card) => {
            const Icon = card.icon

            return (
              <article
                className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm"
                key={card.title}
              >
                <Icon aria-hidden="true" className="size-5 text-emerald-700" />
                <h2 className="mt-4 text-lg font-semibold text-zinc-950">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {card.description}
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
