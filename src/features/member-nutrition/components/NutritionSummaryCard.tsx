"use client";

import Link from "next/link";
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

  const consumedPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round((summary.consumed / Math.max(summary.target, 1)) * 100),
    ),
  );

  const remainingPercent = Math.max(0, 100 - consumedPercent);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (consumedPercent / 100) * circumference;

  const pTarget = 140;
  const cTarget = 270;
  const fTarget = 75;
  const pPercent = Math.min(
    100,
    Math.round(((summary.proteinG || 0) / pTarget) * 100),
  );
  const cPercent = Math.min(
    100,
    Math.round(((summary.carbsG || 0) / cTarget) * 100),
  );
  const fPercent = Math.min(
    100,
    Math.round(((summary.fatG || 0) / fTarget) * 100),
  );

  const hasFoodLogged = summary.consumed > 0;

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm h-full"
      data-testid="member-nutrition-summary-card"
    >
      <div className="grid gap-0 lg:grid-cols-[250px_minmax(0,1fr)] h-full">
        <aside className="relative flex flex-col items-center justify-center border-b border-border bg-primary/5 p-6 text-center lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex size-44 items-center justify-center">
            <svg className="size-full -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-primary/10"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-primary"
                strokeWidth="12"
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
              <span className="mt-2 text-3xl font-black tracking-tight text-foreground">
                {summary.remaining}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Kcal còn
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Info className="size-3.5 text-primary" />
              Tiến độ ăn: {consumedPercent}%
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {hasFoodLogged
                ? `Đã ăn ${formatCalories(summary.consumed)}`
                : "Chưa có bữa nào"}
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
                {getRemainingLabel(summary.remaining)} cho hôm nay
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

          <div className="mt-5 grid gap-3 md:grid-cols-3">
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
              value={getRemainingLabel(summary.remaining)}
              subValue={`${remainingPercent}% còn lại`}
              tone="green"
            />
            <MetricCard
              icon={Target}
              label="Mục tiêu"
              value={formatCalories(summary.target)}
              subValue="Mục tiêu ngày"
              tone="blue"
            />
          </div>

          {!compact ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <MacroBar
                icon="💪"
                label="Protein"
                percent={pPercent}
                target={pTarget}
                value={summary.proteinG}
                valueLabel={formatMacro(summary.proteinG)}
                colorClass="bg-primary"
              />
              <MacroBar
                icon="🌾"
                label="Carb"
                percent={cPercent}
                target={cTarget}
                value={summary.carbsG}
                valueLabel={formatMacro(summary.carbsG)}
                colorClass="bg-amber-500"
              />
              <MacroBar
                icon="💧"
                label="Fat"
                percent={fPercent}
                target={fTarget}
                value={summary.fatG}
                valueLabel={formatMacro(summary.fatG)}
                colorClass="bg-[oklch(0.64_0.12_235)]"
              />
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]"
            >
              <Link href="/member/nutrition/meal-journal#add-meal">
                <Plus aria-hidden="true" className="size-4" />
                Thêm bữa ăn
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
              variant="outline"
            >
              <Link href="/member/nutrition/summary">
                Xem chi tiết
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
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
      className={`rounded-2xl border p-3.5 shadow-sm ${
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
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p
            className={`mt-1 truncate font-black tracking-tight ${
              featured ? "text-xl text-primary" : "text-lg text-foreground"
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
    <div className="rounded-2xl border border-border bg-background p-3.5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-foreground">
              {label}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {hasValue ? valueLabel : "Chưa có dữ liệu"}
            </span>
          </div>

          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
              style={{
                width: `${hasValue ? Math.min(100, Math.max(0, percent)) : 0}%`,
              }}
            />
          </div>
          <p className="mt-1.5 text-right text-[10px] font-semibold text-muted-foreground/70">
            {hasValue ? `${percent}% mục tiêu` : `0g / ${target}g`}
          </p>
        </div>
      </div>
    </div>
  );
}
