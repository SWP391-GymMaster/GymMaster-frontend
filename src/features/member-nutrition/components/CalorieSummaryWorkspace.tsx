"use client";

import { useState, useEffect } from "react";
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
  Settings,
} from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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
import { TdeeCalculator } from "./TdeeCalculator";

const today = getTodayDate();

export function CalorieSummaryWorkspace() {
  const summary = useMemberCalorieSummary(today);
  const logs = useMemberMealLogs(today);

  const [isTdeeOpen, setIsTdeeOpen] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(2200);
  const [pTarget, setPTarget] = useState(140);
  const [cTarget, setCTarget] = useState(270);
  const [fTarget, setFTarget] = useState(75);

  // Sync targets from localStorage or query summary data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCal = localStorage.getItem("gymmaster-calorie-goal");
      const storedP = localStorage.getItem("gymmaster-protein-goal");
      const storedC = localStorage.getItem("gymmaster-carbs-goal");
      const storedF = localStorage.getItem("gymmaster-fat-goal");

      const valCal = storedCal ? Number(storedCal) : (summary.data?.target ?? 2200);
      const valP = storedP ? Number(storedP) : 140;
      const valC = storedC ? Number(storedC) : 270;
      const valF = storedF ? Number(storedF) : 75;

      const timer = setTimeout(() => {
        setCalorieTarget(valCal);
        setPTarget(valP);
        setCTarget(valC);
        setFTarget(valF);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [summary.data?.target]);

  function handleTargetApplied() {
    if (typeof window !== "undefined") {
      const storedCal = localStorage.getItem("gymmaster-calorie-goal");
      const storedP = localStorage.getItem("gymmaster-protein-goal");
      const storedC = localStorage.getItem("gymmaster-carbs-goal");
      const storedF = localStorage.getItem("gymmaster-fat-goal");

      if (storedCal) setCalorieTarget(Number(storedCal));
      if (storedP) setPTarget(Number(storedP));
      if (storedC) setCTarget(Number(storedC));
      if (storedF) setFTarget(Number(storedF));
    }
  }

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

  const target = calorieTarget;
  const consumed = summary.data.consumed;
  const remaining = target - consumed;
  const consumedPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round((consumed / Math.max(target, 1)) * 100),
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

  // Recharts actual calorie distribution data
  const pCalVal = (summary.data.proteinG || 0) * 4;
  const cCalVal = (summary.data.carbsG || 0) * 4;
  const fCalVal = (summary.data.fatG || 0) * 9;
  const totalCalVal = pCalVal + cCalVal + fCalVal;

  const chartData = [
    { name: "Đạm (Protein)", value: pCalVal, color: "hsl(var(--primary))" },
    { name: "Tinh bột (Carbs)", value: cCalVal, color: "#f59e0b" }, // bg-amber-500
    { name: "Chất béo (Fat)", value: fCalVal, color: "#06b6d4" }, // bg-cyan-500 / cyan
  ];

  // Target ratios calculations
  const targetPCal = pTarget * 4;
  const targetCCal = cTarget * 4;
  const targetFCal = fTarget * 9;
  const targetTotalCal = targetPCal + targetCCal + targetFCal;

  const targetPPercent = targetTotalCal > 0 ? Math.round((targetPCal / targetTotalCal) * 100) : 0;
  const targetCPercent = targetTotalCal > 0 ? Math.round((targetCCal / targetTotalCal) * 100) : 0;
  const targetFPercent = targetTotalCal > 0 ? 100 - targetPPercent - targetCPercent : 0;

  const actualPPercent = totalCalVal > 0 ? Math.round((pCalVal / totalCalVal) * 100) : 0;
  const actualCPercent = totalCalVal > 0 ? Math.round((cCalVal / totalCalVal) * 100) : 0;
  const actualFPercent = totalCalVal > 0 ? 100 - actualPPercent - actualCPercent : 0;

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

            <button
              onClick={() => setIsTdeeOpen(true)}
              className="relative flex size-52 items-center justify-center group cursor-pointer"
              title="Click để thay đổi mục tiêu"
            >
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

              <div className="absolute flex flex-col items-center justify-center text-center transition group-hover:scale-105">
                <span className="text-xs font-bold text-muted-foreground">
                  {consumedPercent}%
                </span>
                <span className="mt-2 text-4xl font-black tracking-tight text-foreground">
                  {remaining}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Kcal còn lại
                </span>
              </div>
            </button>

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
                  {getRemainingLabel(remaining)} cho hôm nay
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
                value={formatCalories(consumed)}
                tone="orange"
                subValue={`${consumedPercent}% mục tiêu`}
              />
              <InsightMetric
                featured
                icon={Utensils}
                label="Còn lại"
                value={getRemainingLabel(remaining)}
                tone="green"
                subValue={`${Math.max(0, 100 - consumedPercent)}% còn lại`}
              />
              <button
                type="button"
                onClick={() => setIsTdeeOpen(true)}
                className="text-left focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl block w-full transition active:scale-[0.98]"
              >
                <InsightMetric
                  icon={Target}
                  label="Mục tiêu"
                  value={formatCalories(target)}
                  tone="blue"
                  subValue="Click để cấu hình"
                />
              </button>
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
                colorClass="bg-cyan-500"
                icon="🍟"
              />
            </div>

            {/* Macro Calorie Distribution Chart */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Phân tích tỷ lệ calo thực tế tiêu thụ
              </h3>
              {totalCalVal > 0 ? (
                <div className="grid gap-6 md:grid-cols-[160px_1fr] items-center">
                  <div className="h-[160px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: unknown) => [`${value} kcal`, "Năng lượng"]}
                          contentStyle={{ backgroundColor: "rgba(9, 9, 11, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Tổng nạp</span>
                      <span className="text-base font-black text-foreground">{totalCalVal}</span>
                      <span className="text-[9px] text-muted-foreground">kcal</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Biểu đồ tròn thể hiện tỷ lệ calo nạp từ Đạm, Tinh bột và Chất béo hôm nay so với tỷ lệ phần trăm phân bổ mục tiêu:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-border bg-background p-2.5 text-center">
                        <span className="block text-[10px] font-bold uppercase text-primary">Đạm</span>
                        <div className="mt-1 flex items-baseline justify-center gap-0.5">
                          <span className="text-sm font-black text-foreground">{actualPPercent}%</span>
                          <span className="text-[9px] text-muted-foreground">/{targetPPercent}%</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-2.5 text-center">
                        <span className="block text-[10px] font-bold uppercase text-amber-500">Tinh bột</span>
                        <div className="mt-1 flex items-baseline justify-center gap-0.5">
                          <span className="text-sm font-black text-foreground">{actualCPercent}%</span>
                          <span className="text-[9px] text-muted-foreground">/{targetCPercent}%</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-2.5 text-center">
                        <span className="block text-[10px] font-bold uppercase text-cyan-500">Béo</span>
                        <div className="mt-1 flex items-baseline justify-center gap-0.5">
                          <span className="text-sm font-black text-foreground">{actualFPercent}%</span>
                          <span className="text-[9px] text-muted-foreground">/{targetFPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Chưa ghi bữa ăn nào hôm nay để hiển thị phân tích tỷ lệ dinh dưỡng.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/member/nutrition/meal-journal?view=add"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition hover:bg-foreground/90 active:scale-[0.98] w-full sm:w-auto"
              >
                <Plus className="size-4" />
                Thêm bữa ăn
              </Link>
              <button
                type="button"
                onClick={() => setIsTdeeOpen(true)}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground px-6 text-sm font-semibold transition active:scale-[0.98] w-full sm:w-auto cursor-pointer"
              >
                <Settings className="size-4 text-primary" />
                Cấu hình mục tiêu
              </button>
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

      {/* TDEE Calculator Modal */}
      <TdeeCalculator
        isOpen={isTdeeOpen}
        onClose={() => setIsTdeeOpen(false)}
        onTargetApplied={handleTargetApplied}
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
    orange: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50",
    green: "bg-primary/10 text-primary border-primary/20",
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
  }[tone];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm w-full ${
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
              {hasValue ? `${value}g / ${target}g` : `0g / ${target}g`}
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
              {hasValue ? `${percent}% mục tiêu` : "0% mục tiêu"}
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
