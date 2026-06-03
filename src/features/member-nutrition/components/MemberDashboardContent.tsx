"use client"

import Link from "next/link"
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Salad,
  TrendingUp,
  Utensils,
} from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { Button } from "@/components/ui/button"
import { NutritionSummaryCard } from "@/features/member-nutrition/components/NutritionSummaryCard"
import { useMemberCalorieSummary } from "@/features/member-nutrition/api/member-nutrition.queries"
import { getTodayDate } from "@/features/member-nutrition/utils/nutrition-formatters"
import { gymMasterAssets } from "@/lib/gymmaster-assets"

const today = getTodayDate()

const todayActions = [
  {
    href: "/member/nutrition/meal-journal",
    title: "Ghi bữa ăn",
    description: "Thêm món, khẩu phần và loại bữa cho nhật ký hôm nay.",
    icon: Salad,
  },
  {
    href: "/member/workout",
    title: "Xem giáo án",
    description: "Kiểm tra bài tập, số hiệp, reps và cue kỹ thuật từ PT.",
    icon: Dumbbell,
  },
  {
    href: "/member/trainer-notes",
    title: "Ghi chú PT",
    description: "Đọc phản hồi mới nhất về kỹ thuật và phục hồi.",
    icon: CheckCircle2,
  },
]

export function MemberDashboardContent() {
  const summary = useMemberCalorieSummary(today)

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Utensils aria-hidden="true" className="size-5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Today Command Center
              </p>
              <StatusPill
                className="border-primary/20 bg-primary/10 text-primary"
                label="Gói active"
                status="active"
              />
            </div>

            <h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Hôm nay tập gì, ăn gì và còn bao nhiêu calo?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Theo dõi nhanh giáo án, dinh dưỡng và trạng thái hội viên trong một màn hình, ưu tiên đúng hành động tiếp theo.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroChip label="Mục tiêu" value="2.200 kcal" />
              <HeroChip label="Buổi tiếp theo" value="18:30" />
              <HeroChip label="Check-in" value="Sẵn sàng" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl active:scale-[0.98]">
                <Link href="/member/nutrition/meal-journal">Thêm bữa ăn</Link>
              </Button>
              <Button asChild className="rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]" variant="outline">
                <Link href="/member/workout">Xem giáo án</Link>
              </Button>
            </div>
          </div>
        </div>

        <aside className="grid gap-3">
          {todayActions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
                href={action.href}
                key={action.href}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">
                    {action.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {action.description}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            )
          })}
        </aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <NutritionSummaryCard
          isError={summary.isError}
          isLoading={summary.isLoading}
          summary={summary.data}
        />

        <aside className="grid gap-4">
          <SupportCard
            href="/member/nutrition/summary"
            icon={TrendingUp}
            image={gymMasterAssets.nutritionCover}
            title="Tổng kết calo"
            description="Xem calo đã ăn, còn lại và macro trong ngày."
          />
          <SupportCard
            href="/member/workout"
            icon={CalendarCheck}
            image={gymMasterAssets.workoutCover}
            title="Lịch tập & gói hội viên"
            description="Premium 30 đang active và giáo án PT đã sẵn sàng."
          />
        </aside>
      </section>
    </div>
  )
}

function HeroChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

function SupportCard({
  description,
  href,
  icon: Icon,
  image,
  title,
}: {
  description: string
  href: string
  icon: typeof CalendarCheck
  image: string
  title: string
}) {
  return (
    <Link
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
      href={href}
    >
      <div
        className="h-24 bg-zinc-950"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(24,24,27,0.08), rgba(24,24,27,0.62)), url(${image})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="p-5">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        <h2 className="mt-3 text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  )
}
