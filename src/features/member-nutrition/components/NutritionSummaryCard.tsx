"use client";

import Link from "next/link";
import { Activity, ArrowRight, Flame, Target, Utensils } from "lucide-react";

import { StateBlock } from "@/components/feedback/StateBlock";
import { Button } from "@/components/ui/button";
import type { CalorieSummary } from "@/features/member-nutrition/types/member-nutrition.types";
import {
  formatCalories,
  formatMacro,
  getRemainingLabel,
} from "@/features/member-nutrition/utils/nutrition-formatters";
import { cn } from "@/lib/utils";

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

  // SVG Circular progress computations
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (consumedPercent / 100) * circumference;

  // Macro calculations (aligned targets)
  const pTarget = 140;
  const cTarget = 270;
  const fTarget = 75;

  const pPercent = Math.min(100, Math.round(((summary.proteinG || 0) / pTarget) * 100));
  const cPercent = Math.min(100, Math.round(((summary.carbsG || 0) / cTarget) * 100));
  const fPercent = Math.min(100, Math.round(((summary.fatG || 0) / fTarget) * 100));

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm"
      data-testid="member-nutrition-summary-card"
    >
      <div className="grid h-full gap-0 lg:grid-cols-[260px_1fr]">
        {/* Left Side Gauge Container */}
        <div className="flex h-full flex-col items-center justify-center border-b border-border bg-primary/5 p-6 text-center lg:border-b-0 lg:border-r">
          <div className="relative flex items-center justify-center size-40 shrink-0">
            <svg className="size-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-muted"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-primary"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black tracking-tight text-foreground">
                {summary.remaining}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                Kcal còn
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <h4 className="text-sm font-bold text-foreground">
              Đã ăn {summary.consumed} kcal
            </h4>
            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
              Mục tiêu: {summary.target} kcal
            </p>
          </div>
        </div>

        {/* Right Side Info & Metrics */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Dinh dưỡng hôm nay
                </p>
                <h3 className="mt-1.5 text-xl font-bold tracking-tight text-foreground">
                  Lượng Calorie đã nạp
                </h3>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Activity aria-hidden="true" className="size-4" />
              </span>
            </div>

            {/* Metric grid */}
            <div className="mt-5 grid gap-3 grid-cols-3">
              <Metric
                icon={Target}
                label="Mục tiêu"
                value={formatCalories(summary.target)}
              />
              <Metric
                icon={Flame}
                label="Đã ăn"
                value={formatCalories(summary.consumed)}
              />
              <Metric
                icon={Utensils}
                label="Còn lại"
                value={getRemainingLabel(summary.remaining)}
              />
            </div>

            {/* Macro bars */}
            {!compact && (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MacroBar
                  label="Protein"
                  value={formatMacro(summary.proteinG)}
                  percent={summary.proteinG ? pPercent : 0}
                  colorClass="bg-primary"
                />
                <MacroBar
                  label="Carb"
                  value={formatMacro(summary.carbsG)}
                  percent={summary.carbsG ? cPercent : 0}
                  colorClass="bg-[oklch(0.58_0.095_210)]"
                />
                <MacroBar
                  label="Fat"
                  value={formatMacro(summary.fatG)}
                  percent={summary.fatG ? fPercent : 0}
                  colorClass="bg-amber-500"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]"
            >
              <Link href="/member/nutrition/meal-journal">
                Thêm bữa ăn
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
              variant="outline"
            >
              <Link href="/member/nutrition/summary">Xem chi tiết</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <Icon aria-hidden="true" className="size-4 text-primary shrink-0" />
      <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MacroBar({
  label,
  percent,
  value,
  colorClass = "bg-primary",
}: {
  label: string;
  percent: number;
  value: string;
  colorClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-bold text-foreground">{value}</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-300", colorClass)}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
