"use client";

import { useState } from "react";
import {
  Apple,
  ArrowRight,
  CalendarCheck2,
  Flame,
  Info,
  Plus,
  Salad,
  Settings,
  Target,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { StateBlock } from "@/components/feedback/StateBlock";
import {
  useMemberCalorieSummary,
  useMemberMealLogs,
} from "@/features/member-nutrition/api/member-nutrition.queries";
import { MealLogList } from "@/features/member-nutrition/components/MealLogList";
import { TdeeCalculator } from "@/features/member-nutrition/components/TdeeCalculator";
import {
  formatCalories,
  getRemainingLabel,
  getTodayDate,
} from "@/features/member-nutrition/utils/nutrition-formatters";

export function CalorieSummaryWorkspace() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isTdeeOpen, setIsTdeeOpen] = useState(false);

  const summary = useMemberCalorieSummary(selectedDate);
  const logs = useMemberMealLogs(selectedDate);

  function handleTargetApplied() {
    void summary.refetch();
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

  const today = getTodayDate();
  const isToday = selectedDate === today;
  const selectedDateLabel = formatDisplayDate(selectedDate);
  const titleLabel = isToday ? "Dinh dưỡng hôm nay" : selectedDateLabel;
  const dateContext = isToday ? "hôm nay" : `ngày ${selectedDateLabel}`;

  const hasTarget = summary.data.target != null;
  const consumed = summary.data.consumed;
  const target = summary.data.target;
  const remaining = summary.data.remaining;
  const consumedProtein = summary.data.consumedProteinG;
  const consumedCarb = summary.data.consumedCarbG;
  const consumedFat = summary.data.consumedFatG;
  const targetProtein = summary.data.targetProteinG;
  const targetCarb = summary.data.targetCarbG;
  const targetFat = summary.data.targetFatG;

  const consumedPercent = hasTarget
    ? Math.min(
        100,
        Math.max(0, Math.round((consumed / Math.max(target ?? 1, 1)) * 100)),
      )
    : 0;
  const remainingLabel = remaining == null
    ? "Bạn chưa đặt mục tiêu"
    : getRemainingLabel(remaining);
  const remainingPercent = hasTarget ? Math.max(0, 100 - consumedPercent) : 0;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (consumedPercent / 100) * circumference;

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

  const pPercent = getMacroPercent(consumedProtein, targetProtein);
  const cPercent = getMacroPercent(consumedCarb, targetCarb);
  const fPercent = getMacroPercent(consumedFat, targetFat);

  const pCalVal = consumedProtein * 4;
  const cCalVal = consumedCarb * 4;
  const fCalVal = consumedFat * 9;
  const totalCalVal = pCalVal + cCalVal + fCalVal;

  const chartData = [
    { name: "Đạm", value: pCalVal, color: "hsl(var(--primary))" },
    { name: "Tinh bột", value: cCalVal, color: "#f59e0b" },
    { name: "Chất béo", value: fCalVal, color: "#06b6d4" },
  ];

  const targetPCal = (targetProtein ?? 0) * 4;
  const targetCCal = (targetCarb ?? 0) * 4;
  const targetFCal = (targetFat ?? 0) * 9;
  const targetTotalCal = targetPCal + targetCCal + targetFCal;
  const targetPPercent =
    targetProtein == null || targetTotalCal <= 0
      ? null
      : Math.round((targetPCal / targetTotalCal) * 100);
  const targetCPercent =
    targetCarb == null || targetTotalCal <= 0
      ? null
      : Math.round((targetCCal / targetTotalCal) * 100);
  const targetFPercent =
    targetFat == null ||
    targetTotalCal <= 0 ||
    targetPPercent == null ||
    targetCPercent == null
      ? null
      : 100 - targetPPercent - targetCPercent;

  const actualPPercent =
    totalCalVal > 0 ? Math.round((pCalVal / totalCalVal) * 100) : 0;
  const actualCPercent =
    totalCalVal > 0 ? Math.round((cCalVal / totalCalVal) * 100) : 0;
  const actualFPercent =
    totalCalVal > 0 ? 100 - actualPPercent - actualCPercent : 0;

  return (
    <div className="grid gap-6">
      <section
        className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm"
        data-testid="member-calorie-summary"
      >
        <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
          <aside className="relative flex flex-col items-center justify-center border-b border-border bg-primary/5 p-6 text-center xl:border-b-0 xl:border-r">
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-primary/10 blur-3xl" />

            {hasTarget ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsTdeeOpen(true)}
                  className="group relative flex size-52 cursor-pointer items-center justify-center"
                  title="Cấu hình mục tiêu"
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
                      ? `${logsData.length} bữa đã ghi ${dateContext}`
                      : `Chưa có bữa nào ${dateContext}`}
                  </p>
                </div>
              </>
            ) : (
              <div className="relative rounded-[1.5rem] border border-border bg-card p-6 text-left shadow-sm">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Target aria-hidden="true" className="size-5" />
                </span>
                <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
                  Bạn chưa đặt mục tiêu dinh dưỡng
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Thiết lập mục tiêu calo và macro để hệ thống tính phần còn lại trong ngày.
                </p>
                <button
                  type="button"
                  onClick={() => setIsTdeeOpen(true)}
                  className="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
                >
                  <Settings className="size-4" />
                  Cấu hình mục tiêu
                </button>
              </div>
            )}
          </aside>

          <main className="p-6 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {titleLabel}
                </p>
                <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-foreground">
                  {hasTarget
                    ? `${remainingLabel} cho ${dateContext}`
                    : `Theo dõi số đã ăn ${dateContext}`}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {logsData.length > 0
                    ? "Tiếp tục cập nhật bữa ăn để hệ thống theo dõi calorie và macro chính xác hơn."
                    : "Bạn chưa ghi bữa ăn nào. Hãy bắt đầu với bữa gần nhất để cập nhật calorie và macro."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <label className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm">
                  <span className="sr-only">Chọn ngày tổng kết</span>
                  <CalendarCheck2 className="size-4 text-primary" />
                  <input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="bg-transparent text-sm font-semibold text-foreground outline-none"
                  />
                </label>
                {!isToday ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(getTodayDate())}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
                  >
                    Hôm nay
                  </button>
                ) : null}
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Salad aria-hidden="true" className="size-5" />
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <InsightMetric
                icon={Flame}
                label="Đã ăn"
                value={formatCalories(consumed)}
                tone="orange"
                subValue="Calo thực tế"
              />
              <InsightMetric
                icon={Utensils}
                label="Đạm đã ăn"
                value={formatMacroGrams(consumedProtein)}
                tone="green"
                subValue="Từ bữa đã ghi"
              />
              <InsightMetric
                icon={Salad}
                label="Carb đã ăn"
                value={formatMacroGrams(consumedCarb)}
                tone="blue"
                subValue="Từ bữa đã ghi"
              />
              <InsightMetric
                icon={Apple}
                label="Béo đã ăn"
                value={formatMacroGrams(consumedFat)}
                tone="cyan"
                subValue="Từ bữa đã ghi"
              />
            </div>

            {hasTarget ? (
              <>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <InsightMetric
                    featured
                    icon={Utensils}
                    label="Còn lại"
                    value={remainingLabel}
                    tone="green"
                    subValue={`${remainingPercent}% còn lại`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsTdeeOpen(true)}
                    className="block w-full rounded-2xl text-left transition focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98]"
                  >
                    <InsightMetric
                      icon={Target}
                      label="Mục tiêu"
                      value={formatCalories(target ?? 0)}
                      tone="blue"
                      subValue="Click để cấu hình"
                    />
                  </button>
                  <InsightMetric
                    icon={Info}
                    label="Tiến độ"
                    value={`${consumedPercent}%`}
                    tone="orange"
                    subValue="So với mục tiêu"
                  />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <MacroTrack
                    label="Đạm"
                    value={consumedProtein}
                    target={targetProtein}
                    percent={pPercent}
                    colorClass="bg-primary"
                  />
                  <MacroTrack
                    label="Tinh bột"
                    value={consumedCarb}
                    target={targetCarb}
                    percent={cPercent}
                    colorClass="bg-amber-500"
                  />
                  <MacroTrack
                    label="Chất béo"
                    value={consumedFat}
                    target={targetFat}
                    percent={fPercent}
                    colorClass="bg-cyan-500"
                  />
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phân tích tỷ lệ calo thực tế tiêu thụ
                  </h3>
                  {totalCalVal > 0 ? (
                    <div className="grid items-center gap-6 md:grid-cols-[160px_1fr]">
                      <div className="relative flex h-[160px] w-full items-center justify-center">
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
                              {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: unknown) => [
                                `${value} kcal`,
                                "Năng lượng",
                              ]}
                              contentStyle={{
                                backgroundColor: "rgba(9, 9, 11, 0.95)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                color: "white",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground">
                            Tổng nạp
                          </span>
                          <span className="text-base font-black text-foreground">
                            {Math.round(totalCalVal)}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            kcal
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Biểu đồ thể hiện tỷ lệ calo nạp từ đạm, tinh bột và chất béo so với tỷ lệ mục tiêu đã đặt.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <MacroRatioCard
                            actual={actualPPercent}
                            label="Đạm"
                            target={targetPPercent}
                            tone="text-primary"
                          />
                          <MacroRatioCard
                            actual={actualCPercent}
                            label="Tinh bột"
                            target={targetCPercent}
                            tone="text-amber-500"
                          />
                          <MacroRatioCard
                            actual={actualFPercent}
                            label="Béo"
                            target={targetFPercent}
                            tone="text-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      Chưa ghi bữa ăn nào {dateContext} để hiển thị phân tích tỷ lệ dinh dưỡng.
                    </div>
                  )}
                </div>
              </>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/member/nutrition/meal-journal?view=add"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition hover:bg-foreground/90 active:scale-[0.98] sm:w-auto"
              >
                <Plus className="size-4" />
                Thêm bữa ăn
              </Link>
              <button
                type="button"
                onClick={() => setIsTdeeOpen(true)}
                className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98] sm:w-auto"
              >
                <Settings className="size-4 text-primary" />
                Cấu hình mục tiêu
              </button>
            </div>
          </main>

          <aside className="border-t border-border bg-background/50 p-5 xl:border-l xl:border-t-0">
            <div className="h-full rounded-2xl border border-border bg-card p-4 shadow-sm">
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

      <MealLogList
        isError={logs.isError}
        isLoading={logs.isLoading}
        logs={logs.data}
      />

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
  tone: "orange" | "green" | "blue" | "cyan";
  value: string;
}) {
  const toneClasses = {
    orange: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50",
    green: "bg-primary/10 text-primary border-primary/20",
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/50",
  }[tone];

  return (
    <div
      className={`w-full rounded-2xl border p-4 shadow-sm ${
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
}: {
  label: string;
  value: number;
  target: number | null;
  percent: number;
  colorClass: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
          {label.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground">
              {label}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {formatMacroGrams(value)} / {formatMacroTarget(target)}
            </span>
          </div>

          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="mt-1.5 block text-right text-[10px] font-semibold text-muted-foreground/70">
              {target == null ? "Mục tiêu chưa đặt" : `${percent}% mục tiêu`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MacroRatioCard({
  actual,
  label,
  target,
  tone,
}: {
  actual: number;
  label: string;
  target: number | null;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-2.5 text-center">
      <span className={`block text-[10px] font-bold uppercase ${tone}`}>
        {label}
      </span>
      <div className="mt-1 flex items-baseline justify-center gap-0.5">
        <span className="text-sm font-black text-foreground">{actual}%</span>
        <span className="text-[9px] text-muted-foreground">
          /{target == null ? "—" : `${target}%`}
        </span>
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
    <div className="flex min-h-[140px] flex-col justify-between rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {count} món ăn đã ghi
          </p>
        </div>
        <span className="shrink-0 rounded-xl bg-primary/10 p-2 text-primary">
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
          className="inline-flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground transition hover:bg-primary hover:text-primary-foreground active:scale-90"
          title={`Thêm món vào ${title}`}
        >
          <Plus className="size-5" />
        </Link>
      </div>
    </div>
  );
}

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function formatMacroGrams(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}g`;
}

function formatMacroTarget(value: number | null) {
  return value == null ? "—" : formatMacroGrams(value);
}

function getMacroPercent(value: number, target: number | null) {
  if (target == null || target <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / target) * 100)));
}
