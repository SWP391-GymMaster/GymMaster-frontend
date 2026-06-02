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
    title: "Ghi bữa ăn",
    description: "Thêm món, khẩu phần và loại bữa cho nhật ký hôm nay.",
    icon: Salad,
  },
  {
    href: "/member/nutrition/summary",
    title: "Xem calo",
    description: "Theo dõi đã ăn, mục tiêu, còn lại và macro.",
    icon: TrendingUp,
  },
]

const supportCards = [
  {
    title: "Gói hội viên",
    description: "Premium 30 đang active đến ngày 30/06.",
    icon: CalendarCheck,
  },
  {
    title: "Luyện tập",
    description: "Giáo án và ghi chú PT đã sẵn sàng trong workspace hội viên.",
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
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Trung tâm hội viên
            </p>
            <StatusPill
              className="border-white/10 bg-white/10 text-white"
              label="Gói đang active"
              status="active"
            />
          </div>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
            Giữ nhịp tập luyện và dinh dưỡng mỗi ngày.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            Ghi bữa ăn hôm nay, theo dõi calo còn lại và xem nhanh ngữ cảnh
            luyện tập ngay trong workspace hội viên.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="default">
              <Link href="/member/nutrition/meal-journal">Thêm bữa ăn</Link>
            </Button>
            <Button
              asChild
              
              variant="outline"
            >
              <Link href="/member/nutrition/summary">Xem tổng kết</Link>
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
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                <Icon aria-hidden="true" className="size-5 text-primary" />
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
