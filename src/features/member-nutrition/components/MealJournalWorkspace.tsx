"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Plus, Target, Utensils } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { MealLogForm } from "@/features/member-nutrition/components/MealLogForm";
import { MealLogList } from "@/features/member-nutrition/components/MealLogList";
import { NutritionSummaryCard } from "@/features/member-nutrition/components/NutritionSummaryCard";
import { TdeeCalculator } from "@/features/member-nutrition/components/TdeeCalculator";
import {
  useMemberCalorieSummary,
  useMemberMealLogs,
} from "@/features/member-nutrition/api/member-nutrition.queries";
import { getTodayDate } from "@/features/member-nutrition/utils/nutrition-formatters";
import { gymMasterAssets } from "@/lib/gymmaster-assets";

export function MealJournalWorkspace() {
  const today = getTodayDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;
  const summary = useMemberCalorieSummary(selectedDate);
  const logs = useMemberMealLogs(selectedDate);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeView, setActiveView] = useState<"list" | "add">("list");
  const [defaultMealType, setDefaultMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("lunch");
  // null = chua dat muc tieu (BE la nguon su that). KHONG bia 2200, KHONG doc localStorage.
  const [optimisticCalorieTarget, setOptimisticCalorieTarget] = useState<
    number | null
  >(null);
  const [isTdeeOpen, setIsTdeeOpen] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      const viewParam = searchParams.get("view");
      const typeParam = searchParams.get("type");

      if (viewParam === "add" || hash.startsWith("#add-meal")) {
        setActiveView("add");

        let mealType: "breakfast" | "lunch" | "dinner" | "snack" = "lunch";
        if (
          typeParam &&
          ["breakfast", "lunch", "dinner", "snack"].includes(typeParam)
        ) {
          mealType = typeParam as "breakfast" | "lunch" | "dinner" | "snack";
        } else if (hash.includes("breakfast")) {
          mealType = "breakfast";
        } else if (hash.includes("lunch")) {
          mealType = "lunch";
        } else if (hash.includes("dinner")) {
          mealType = "dinner";
        } else if (hash.includes("snack")) {
          mealType = "snack";
        }

        setDefaultMealType(mealType);

        // Clean up hash to prevent double-hash loops
        if (hash.startsWith("#add-meal")) {
          router.replace(
            `/member/nutrition/meal-journal?view=add&type=${mealType}`,
          );
        }
      } else {
        setActiveView("list");
      }
    };

    handleLocationChange();

    window.addEventListener("hashchange", handleLocationChange);
    return () => window.removeEventListener("hashchange", handleLocationChange);
  }, [searchParams, router]);

  const calorieTarget = optimisticCalorieTarget ?? summary.data?.target ?? null;

  function handleTargetApplied(newTarget: number) {
    setOptimisticCalorieTarget(newTarget);
    void summary.refetch().finally(() => setOptimisticCalorieTarget(null));
  }

  function handleBackToList() {
    router.push("/member/nutrition/meal-journal");
  }

  return (
    <div className="grid gap-6">
      {activeView === "list" ? (
        <>
          <section className="relative min-h-[300px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950 shadow-xl">
            <div
              className="absolute inset-0 scale-[1.02]"
              style={{
                backgroundImage: `url(${gymMasterAssets.backgrounds.nutritionMeal})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(34,197,94,0.28),transparent_34%),linear-gradient(90deg,rgba(3,7,6,0.95)_0%,rgba(3,7,6,0.82)_42%,rgba(3,7,6,0.48)_74%,rgba(3,7,6,0.25)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 to-transparent" />

            <div className="relative flex min-h-[300px] flex-col justify-between p-6 md:p-7">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-primary shadow-sm backdrop-blur-md">
                    <Utensils aria-hidden="true" className="size-5" />
                  </span>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
                    {isToday ? "Nhật ký hôm nay" : "Nhật ký"}
                  </span>
                  <label className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 backdrop-blur-md">
                    <CalendarDays
                      aria-hidden="true"
                      className="size-5 text-primary"
                    />
                    <span className="sr-only">Chọn ngày nhật ký</span>
                    <input
                      type="date"
                      value={selectedDate}
                      max={today}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="bg-transparent text-sm font-semibold text-zinc-100 outline-none [color-scheme:dark]"
                    />
                  </label>
                  {!isToday ? (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(today)}
                      className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
                    >
                      Hôm nay
                    </button>
                  ) : null}
                </div>

                <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Ghi bữa nhanh, giữ calo đúng nhịp.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-200/90 md:text-base">
                  Tìm món, chọn khẩu phần và cập nhật nhật ký ăn trong ngày với
                  dữ liệu calo rõ ràng.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() =>
                    router.push("/member/nutrition/meal-journal?view=add")
                  }
                  className="min-h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-95 active:scale-[0.98]"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Thêm bữa ăn mới
                </Button>

                <Button
                  onClick={() => setIsTdeeOpen(true)}
                  className="min-h-12 rounded-xl border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/15 active:scale-[0.98]"
                  variant="outline"
                >
                  <Target aria-hidden="true" className="size-4" />
                  Tính TDEE
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-sm backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                      Mục tiêu calo
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {calorieTarget != null
                        ? `${calorieTarget.toLocaleString("vi-VN")} kcal`
                        : "Chưa đặt mục tiêu"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <NutritionSummaryCard
            compact
            isError={summary.isError}
            isLoading={summary.isLoading}
            summary={summary.data}
          />

          <MealLogList
            isError={logs.isError}
            isLoading={logs.isLoading}
            logs={logs.data}
          />
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBackToList}
                variant="outline"
                className="rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
              >
                ← Quay lại lịch sử ăn
              </Button>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Ghi bữa ăn mới
              </h2>
            </div>
            <MealLogForm
              date={selectedDate}
              defaultMealType={defaultMealType}
              onSuccess={handleBackToList}
            />
          </div>
        </div>
      )}

      <TdeeCalculator
        isOpen={isTdeeOpen}
        onClose={() => setIsTdeeOpen(false)}
        onTargetApplied={handleTargetApplied}
      />
    </div>
  );
}
