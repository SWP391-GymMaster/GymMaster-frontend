"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Flame,
  Info,
  Plus,
  Salad,
  Target,
  Utensils,
} from "lucide-react";

import { StateBlock } from "@/components/feedback/StateBlock";
import { Button } from "@/components/ui/button";
import type { CalorieSummary } from "@/features/member-nutrition/types/member-nutrition.types";
import {
  formatCalories,
  formatMacro,
  getRemainingLabel,
} from "@/features/member-nutrition/utils/nutrition-formatters";

type NutritionSummaryCardProps = {
  summary?: CalorieSummary;
  isLoading?: boolean;
  isError?: boolean;
  compact?: boolean;
};

export function NutritionSummaryCard({
  summary,
  isLoading = false,
  isError = false,
  compact = false,
}: NutritionSummaryCardProps) {
  const pathname = usePathname();
  const isOnSummaryPage = pathname === "/member/nutrition/summary";
  const [localTarget, setLocalTarget] = useState(summary?.target ?? 2200);
  const [pTarget, setPTarget] = useState(140);
  const [cTarget, setCTarget] = useState(270);
  const [fTarget, setFTarget] = useState(75);

  useEffect(() => {
    const targetVal = summary?.target ?? 2200;
    const override = localStorage.getItem("gymmaster-calorie-goal");
    const val = override ? Number(override) : targetVal;

    const overrideP = localStorage.getItem("gymmaster-protein-goal");
    const overrideC = localStorage.getItem("gymmaster-carbs-goal");
    const overrideF = localStorage.getItem("gymmaster-fat-goal");

    const timer = setTimeout(() => {
      setLocalTarget(val);
      if (overrideP) setPTarget(Number(overrideP));
      if (overrideC) setCTarget(Number(overrideC));
      if (overrideF) setFTarget(Number(overrideF));
    }, 0);

    return () => clearTimeout(timer);
  }, [summary?.target]);

  if (isLoading) {
    return (
      <StateBlock
        description="Đang tải mục tiêu calo và lượng đã ăn hôm nay."
        title="Đang tải tổng kết dinh dưỡng..."
        tone="loading"
      />
    );
  }

  if (isError) {
    return (
      <StateBlock
        description="Tải lại workspace hoặc thử lại sau khi dịch vụ ổn định."
        title="Không thể tải tổng kết dinh dưỡng."
        tone="error"
      />
    );
  }

  if (!summary) {
    return (
      <StateBlock
        description="Thêm bữa ăn đầu tiên để bắt đầu theo dõi hôm nay."
        title="Chưa có tổng kết dinh dưỡng."
        tone="empty"
      />
    );
  }

  const target = localTarget;
  const consumed = summary.consumed;
  const remaining = target - consumed;

  const consumedPercent = Math.min(
    100,
    Math.max(0, Math.round((consumed / Math.max(target, 1)) * 100)),
  );

  const remainingPercent = Math.max(0, 100 - consumedPercent);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (consumedPercent / 100) * circumference;

  const pPercent = Math.min(
    100,
    Math.round(((summary.consumedProteinG || 0) / pTarget) * 100),
  );
  const cPercent = Math.min(
    100,
    Math.round(((summary.consumedCarbG || 0) / cTarget) * 100),
  );
  const fPercent = Math.min(
    100,
    Math.round(((summary.consumedFatG || 0) / fTarget) * 100),
  );

  const hasFoodLogged = summary.consumed > 0;

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm h-full"
      data-testid="member-nutrition-summary-card"
    >
      <div className="grid gap-0 lg:grid-cols-[250px_minmax(0,1fr)] h-full">
        <aside className="relative flex flex-row lg:flex-col items-center justify-center gap-5 lg:gap-0 border-b border-border bg-primary/5 p-5 lg:p-6 text-center lg:border-b-0 lg:border-r shrink-0">
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex size-36 lg:size-44 shrink-0 items-center justify-center">
            <svg className="size-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius - 12}
                className="stroke-primary/10 lg:hidden"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius - 12}
                className="stroke-primary lg:hidden"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * (radius - 12)}
                strokeDashoffset={
                  2 * Math.PI * (radius - 12) -
                  (consumedPercent / 100) * 2 * Math.PI * (radius - 12)
                }
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />

              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-primary/10 hidden lg:block"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-primary hidden lg:block"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] lg:text-xs font-bold text-muted-foreground">
                {consumedPercent}%
              </span>
              <span className="mt-1 lg:mt-2 text-2xl lg:text-3xl font-black tracking-tight text-foreground">
                {remaining}
              </span>
              <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Kcal còn
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center text-left lg:text-center lg:mt-5 rounded-2xl border border-border bg-card px-3.5 py-2.5 lg:px-4 lg:py-3 shadow-sm max-w-[180px]">
            <p className="flex items-center lg:justify-center gap-1.5 text-[11px] lg:text-xs font-semibold text-muted-foreground">
              <Info className="size-3.5 text-primary" />
              Tiến độ ăn
            </p>
            <p className="mt-1 text-xs lg:text-sm font-semibold text-foreground whitespace-nowrap">
              {hasFoodLogged
                ? `Đã ăn ${formatCalories(summary.consumed)}`
                : "Chưa có bữa"}
            </p>
          </div>
        </aside>

        <main className="flex flex-col justify-center p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Dinh dưỡng hôm nay
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {getRemainingLabel(remaining)} cho hôm nay
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {hasFoodLogged
                  ? "Tiếp tục cập nhật bữa ăn để theo dõi calorie và macro chính xác hơn."
                  : "Bạn chưa ghi bữa ăn nào. Hãy bắt đầu với bữa gần nhất để cập nhật calorie và macro."}
              </p>
            </div>

            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Salad aria-hidden="true" className="size-5" />
            </span>
          </div>

          <div className="mt-5 grid gap-2 grid-cols-3 lg:gap-3">
            <MetricCard
              icon={Flame}
              label="Đã ăn"
              value={formatCalories(summary.consumed)}
              subValue={`${consumedPercent}% mục tiêu`}
              tone="orange"
            />
            <MetricCard
              featured
              icon={Utensils}
              label="Còn lại"
              value={getRemainingLabel(remaining)}
              subValue={`${remainingPercent}% còn lại`}
              tone="green"
            />
            <MetricCard
              icon={Target}
              label="Mục tiêu"
              value={formatCalories(target)}
              subValue="Mục tiêu ngày"
              tone="blue"
            />
          </div>

          {!compact ? (
            <div className="mt-4 grid gap-2 grid-cols-3 lg:gap-3">
              <MacroBar
                icon="🍖"
                label="Đạm"
                percent={pPercent}
                target={pTarget}
                value={summary.consumedProteinG}
                valueLabel={formatMacro(summary.consumedProteinG)}
                colorClass="bg-primary"
              />
              <MacroBar
                icon="🍞"
                label="Tinh Bột"
                percent={cPercent}
                target={cTarget}
                value={summary.consumedCarbG}
                valueLabel={formatMacro(summary.consumedCarbG)}
                colorClass="bg-amber-500"
              />
              <MacroBar
                icon="🍟"
                label="Chất Béo"
                percent={fPercent}
                target={fTarget}
                value={summary.consumedFatG}
                valueLabel={formatMacro(summary.consumedFatG)}
                colorClass="bg-[oklch(0.64_0.12_235)]"
              />
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] min-h-[52px] w-full sm:w-auto px-6"
            >
              <Link href="/member/nutrition/meal-journal?view=add">
                <Plus aria-hidden="true" className="size-4" />
                Thêm bữa ăn
              </Link>
            </Button>
            {!isOnSummaryPage && (
              <Button
                asChild
                className="rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98] min-h-[52px] w-full sm:w-auto px-6"
              >
                <Link href="/member/nutrition/summary">
                  Xem chi tiết
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}

function MetricCard({
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
    orange: "border-orange-100 bg-orange-50 text-orange-600",
    green: "border-primary/20 bg-primary/10 text-primary",
    blue: "border-blue-100 bg-blue-50 text-blue-600",
  }[tone];

  return (
    <div
      className={`rounded-2xl border p-2 lg:p-3.5 shadow-sm ${
        featured
          ? "border-primary/25 bg-primary/5"
          : "border-border bg-background"
      }`}
    >
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-1.5 lg:gap-3 text-center lg:text-left">
        <span
          className={`flex size-8 lg:size-10 shrink-0 items-center justify-center rounded-lg lg:rounded-xl border ${toneClasses}`}
        >
          <Icon aria-hidden="true" className="size-4 lg:size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p
            className={`mt-0.5 lg:mt-1 truncate font-semibold tracking-tight text-xs lg:text-lg ${
              featured ? "text-primary font-black" : "text-foreground"
            }`}
          >
            {value}
          </p>
          <p className="mt-2 hidden lg:inline-block rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            {subValue}
          </p>
        </div>
      </div>
    </div>
  );
}

function MacroBar({
  colorClass,
  icon,
  label,
  percent,
  target,
  value,
  valueLabel,
}: {
  colorClass: string;
  icon: string;
  label: string;
  percent: number;
  target: number;
  value?: number;
  valueLabel: string;
}) {
  const hasValue = Boolean(value && value > 0);

  return (
    <div className="rounded-2xl border border-border bg-background p-2.5 lg:p-3.5">
      <div className="flex items-start gap-2 lg:gap-3">
        <span className="hidden lg:flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-0.5 lg:gap-2">
            <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.12em] text-foreground truncate">
              {label}
            </span>
            <span className="text-[10px] lg:text-xs font-bold text-muted-foreground truncate">
              {hasValue ? valueLabel : "Chưa có dữ liệu"}
            </span>
          </div>

          <div className="mt-2 h-1 lg:h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
              style={{
                width: `${hasValue ? Math.min(100, Math.max(0, percent)) : 0}%`,
              }}
            />
          </div>
          <p className="mt-1 text-right text-[8px] lg:text-[10px] font-semibold text-muted-foreground/70">
            {hasValue ? `${percent}%` : `${target}g`}
          </p>
        </div>
      </div>
    </div>
  );
}
