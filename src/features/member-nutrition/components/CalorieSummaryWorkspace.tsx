"use client";

import {
  Apple,
  ArrowRight,
  CalendarCheck2,
  Flame,
  Info,
  Plus,
  Salad,
  Target,
  Utensils,
} from "lucide-react";
import Link from "next/link";

import { StateBlock } from "@/components/feedback/StateBlock";
import { MealLogList } from "@/features/member-nutrition/components/MealLogList";
import {
  useMemberCalorieSummary,
  useMemberMealLogs,
} from "@/features/member-nutrition/api/member-nutrition.queries";
import {
  formatCalories,
  getRemainingLabel,
  getTodayDate,
} from "@/features/member-nutrition/utils/nutrition-formatters";

const today = getTodayDate();

export function CalorieSummaryWorkspace() {
  const summary = useMemberCalorieSummary(today);
  const logs = useMemberMealLogs(today);

  if (summary.isLoading) {
    return (
      <StateBlock
        description="Đang tải calo, mục tiêu và phân tích bữa ăn."
        title="Đang tải tổng kết ngày..."
        tone="loading"
      />
    );
  }

  if (summary.isError) {
    return (
      <StateBlock
        description="Tải lại trang hoặc thử lại sau khi dịch vụ ổn định."
        title="Không thể tải tổng kết ngày."
        tone="error"
      />
    );
  }

  if (!summary.data) {
    return (
      <StateBlock
        description="Thêm bữa ăn để bắt đầu theo dõi calo."
        title="Chưa có dữ liệu tổng kết."
        tone="empty"
      />
    );
  }

  const consumedPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (summary.data.consumed / Math.max(summary.data.target, 1)) * 100,
      ),
    ),
  );

  // MyFitnessPal SVG circular progress calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (consumedPercent / 100) * circumference;

  // Categorize log values
  const logsData = logs.data || [];
  const breakfastLogs = logsData.filter(
    (log) => log.mealType?.toLowerCase() === "breakfast",
  );
  const lunchLogs = logsData.filter(
    (log) => log.mealType?.toLowerCase() === "lunch",
  );
  const dinnerLogs = logsData.filter(
    (log) => log.mealType?.toLowerCase() === "dinner",
  );
  const snackLogs = logsData.filter(
    (log) =>
      log.mealType?.toLowerCase() === "snack" ||
      log.mealType?.toLowerCase() === "snacks",
  );

  const getCaloriesSum = (mealLogs: typeof logsData) => {
    return mealLogs.reduce((sum, log) => {
      return (
        sum +
        log.items.reduce((itemSum, item) => itemSum + (item.calories || 0), 0)
      );
    }, 0);
  };

  const breakfastCal = getCaloriesSum(breakfastLogs);
  const lunchCal = getCaloriesSum(lunchLogs);
  const dinnerCal = getCaloriesSum(dinnerLogs);
  const snackCal = getCaloriesSum(snackLogs);

  // Define macro target limits based on 2200 kcal average target
  const pTarget = 140;
  const cTarget = 270;
  const fTarget = 75;

  const pPercent = Math.min(
    100,
    Math.round(((summary.data.proteinG || 0) / pTarget) * 100),
  );
  const cPercent = Math.min(
    100,
    Math.round(((summary.data.carbsG || 0) / cTarget) * 100),
  );
  const fPercent = Math.min(
    100,
    Math.round(((summary.data.fatG || 0) / fTarget) * 100),
  );

  return (
    <div className="grid gap-6">
      {/* Nutrition Control Card */}
      <section
        className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm"
        data-testid="member-calorie-summary"
      >
        <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
          {/* Circular Gauge */}
          <aside className="relative flex flex-col items-center justify-center border-b border-border bg-primary/5 p-6 text-center xl:border-b-0 xl:border-r">
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex size-52 items-center justify-center">
              <svg className="size-full -rotate-90">
                <circle
                  cx="104"
                  cy="104"
                  r={radius}
                  className="stroke-primary/10"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="104"
                  cy="104"
                  r={radius}
                  className="stroke-primary"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-muted-foreground">
                  {consumedPercent}%
                </span>
                <span className="mt-2 text-4xl font-black tracking-tight text-foreground">
                  {summary.data.remaining}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Kcal còn lại
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Info className="size-3.5 text-primary" />
                Tiến độ ăn: {consumedPercent}%
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {logsData.length > 0
                  ? `${logsData.length} bữa đã ghi hôm nay`
                  : "Chưa có bữa nào hôm nay"}
              </p>
            </div>
          </aside>

          {/* Main Insight */}
          <main className="p-6 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Dinh dưỡng hôm nay
                </p>
                <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-foreground">
                  {getRemainingLabel(summary.data.remaining)} cho hôm nay
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {logsData.length > 0
                    ? "Tiếp tục cập nhật bữa ăn để hệ thống theo dõi calorie và macro chính xác hơn."
                    : "Bạn chưa ghi bữa ăn nào. Hãy bắt đầu với bữa gần nhất để cập nhật calorie và macro."}
                </p>
              </div>

              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Salad aria-hidden="true" className="size-5" />
              </span>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <InsightMetric
                icon={Flame}
                label="Đã ăn"
                value={formatCalories(summary.data.consumed)}
                tone="orange"
                subValue={`${consumedPercent}% mục tiêu`}
              />
              <InsightMetric
                featured
                icon={Utensils}
                label="Còn lại"
                value={getRemainingLabel(summary.data.remaining)}
                tone="green"
                subValue={`${Math.max(0, 100 - consumedPercent)}% còn lại`}
              />
              <InsightMetric
                icon={Target}
                label="Mục tiêu"
                value={formatCalories(summary.data.target)}
                tone="blue"
                subValue="Mục tiêu ngày"
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MacroTrack
                label="Đạm"
                value={summary.data.proteinG}
                target={pTarget}
                percent={pPercent}
                colorClass="bg-primary"
                icon="🍖"
              />
              <MacroTrack
                label="Tinh Bột"
                value={summary.data.carbsG}
                target={cTarget}
                percent={cPercent}
                colorClass="bg-amber-500"
                icon="🍞"
              />
              <MacroTrack
                label="Chất Béo"
                value={summary.data.fatG}
                target={fTarget}
                percent={fPercent}
                colorClass="bg-[oklch(0.64_0.12_235)]"
                icon="🍟"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/member/nutrition/meal-journal?view=add"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition hover:bg-foreground/90 active:scale-[0.98] w-full sm:w-auto"
              >
                <Plus className="size-4" />
                Thêm bữa ăn
              </Link>
              <Link
                href="/member/nutrition/summary"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
              >
                Xem chi tiết
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </main>

          {/* Next Actions */}
          <aside className="border-t border-border bg-background/50 p-5 xl:border-l xl:border-t-0">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm h-full">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarCheck2 aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Bước tiếp theo
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    Ghi bữa gần nhất
                  </p>
                </div>
              </div>

              <div className="mt-4 divide-y divide-border">
                <NextAction
                  label="Thêm bữa sáng"
                  href="/member/nutrition/meal-journal?view=add&type=breakfast"
                />
                <NextAction
                  label="Thêm bữa trưa"
                  href="/member/nutrition/meal-journal?view=add&type=lunch"
                />
                <NextAction
                  label="Thêm bữa tối"
                  href="/member/nutrition/meal-journal?view=add&type=dinner"
                />
                {/* <NextAction label="Xem tổng kết" href="/member/nutrition/summary" /> */}
              </div>

              <div className="mt-4 rounded-2xl bg-primary/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  Gợi ý
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ghi bữa ăn giúp hệ thống tính calorie và macro chính xác hơn.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Categorized Meal Blocks */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CategoryCard
          title="Bữa sáng"
          kcal={breakfastCal}
          count={breakfastLogs.length}
          type="breakfast"
        />
        <CategoryCard
          title="Bữa trưa"
          kcal={lunchCal}
          count={lunchLogs.length}
          type="lunch"
        />
        <CategoryCard
          title="Bữa tối"
          kcal={dinnerCal}
          count={dinnerLogs.length}
          type="dinner"
        />
        <CategoryCard
          title="Bữa nhẹ"
          kcal={snackCal}
          count={snackLogs.length}
          type="snack"
        />
      </section>

      {/* Timeline logs */}
      <MealLogList
        isError={logs.isError}
        isLoading={logs.isLoading}
        logs={logs.data}
      />
    </div>
  );
}

function InsightMetric({
  featured = false,
  icon: Icon,
  label,
  subValue,
  tone,
  value,
}: {
  featured?: boolean;
  icon: typeof Flame;
  label: string;
  subValue: string;
  tone: "orange" | "green" | "blue";
  value: string;
}) {
  const toneClasses = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    green: "bg-primary/10 text-primary border-primary/20",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  }[tone];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        featured
          ? "border-primary/25 bg-primary/5"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${toneClasses}`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p
            className={`mt-1 truncate font-black tracking-tight ${
              featured ? "text-2xl text-primary" : "text-xl text-foreground"
            }`}
          >
            {value}
          </p>
          <p className="mt-2 w-fit rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            {subValue}
          </p>
        </div>
      </div>
    </div>
  );
}

function MacroTrack({
  label,
  value,
  target,
  percent,
  colorClass,
  icon,
}: {
  label: string;
  value?: number;
  target: number;
  percent: number;
  colorClass: string;
  icon: string;
}) {
  const hasValue = Boolean(value && value > 0);

  return (
    <div className="rounded-2xl border border-border/80 bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground">
              {label}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {hasValue ? `${value}g / ${target}g` : "Chưa có dữ liệu"}
            </span>
          </div>

          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                style={{ width: `${hasValue ? percent : 0}%` }}
              />
            </div>
            <span className="mt-1.5 block text-right text-[10px] font-semibold text-muted-foreground/70">
              {hasValue ? `${percent}% mục tiêu` : "0g / " + target + "g"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NextAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-12 items-center justify-between gap-3 text-sm font-medium text-foreground transition hover:text-primary"
    >
      <span className="flex items-center gap-3">
        <Plus className="size-4 text-primary" />
        {label}
      </span>
      <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function CategoryCard({
  title,
  kcal,
  count,
  type,
}: {
  title: string;
  kcal: number;
  count: number;
  type: "breakfast" | "lunch" | "dinner" | "snack";
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {count} món ăn đã ghi
          </p>
        </div>
        <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
          <Apple className="size-4" />
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <span className="text-xl font-black text-foreground">
          {kcal}{" "}
          <span className="text-xs font-semibold text-muted-foreground">
            Kcal
          </span>
        </span>
        <Link
          href={`/member/nutrition/meal-journal?view=add&type=${type}`}
          className="inline-flex size-11 items-center justify-center rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground transition active:scale-90"
          title={`Thêm món vào ${title}`}
        >
          <Plus className="size-5" />
        </Link>
      </div>
    </div>
  );
}
