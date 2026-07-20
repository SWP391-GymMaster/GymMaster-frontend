"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Dumbbell,
  ListChecks,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StateBlock } from "@/components/feedback/StateBlock";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/features/auth/components/PermissionGuard";
import { useMember360Data } from "@/features/member-360/api/member-360.queries";
import {
  useCreateMemberWorkoutPlan,
  useDeleteMemberWorkoutPlan,
  useMemberWorkoutPlans,
  useUpdateMemberWorkoutPlan,
} from "@/features/pt-training/api/pt-training.queries";
import { TrainingMemberContext } from "@/features/pt-training/components/TrainingMemberContext";
import { WorkoutPlanForm } from "@/features/pt-training/components/WorkoutPlanForm";
import { WorkoutPlanList } from "@/features/pt-training/components/WorkoutPlanList";
import { exerciseLibrary } from "@/features/pt-training/data/exercise-library";
import { getWorkoutAssetForExercise } from "@/features/pt-training/data/workout-assets";
import type {
  WorkoutPlan,
  WorkoutPlanDraft,
} from "@/features/pt-training/types/pt-training.types";

const exerciseFilters = [
  { label: "Tất cả", categories: [] },
  { label: "Ngực", categories: ["Chest"] },
  { label: "Lưng", categories: ["Back"] },
  { label: "Vai", categories: ["Shoulders"] },
  { label: "Chân", categories: ["Legs", "Glutes"] },
  { label: "Core", categories: ["Core"] },
] as const;

type ExerciseFilter = (typeof exerciseFilters)[number]["label"];

export function PtWorkoutPlanWorkspace() {
  const params = useParams<{ id: string }>();
  const memberId = Number(params.id);
  const validMemberId =
    Number.isFinite(memberId) && memberId > 0 ? memberId : null;

  const memberQuery = useMember360Data(validMemberId);
  const plansQuery = useMemberWorkoutPlans(validMemberId);
  const createPlan = useCreateMemberWorkoutPlan(validMemberId ?? 0);
  const updatePlan = useUpdateMemberWorkoutPlan(validMemberId ?? 0);
  const deletePlan = useDeleteMemberWorkoutPlan(validMemberId ?? 0);

  const [activeView, setActiveView] = useState<"list" | "create">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ExerciseFilter>("Tất cả");
  const [visibleCount, setVisibleCount] = useState(5);
  const [externalExerciseToAdd, setExternalExerciseToAdd] = useState<string>();

  const plans = plansQuery.data ?? [];
  const plansCount = plans.length;
  const totalExercisesCount = plans.reduce(
    (sum, plan) => sum + plan.exercises.length,
    0,
  );
  const latestPlan = plans[0];

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const activeFilter = exerciseFilters.find(
      (filter) => filter.label === activeCategory,
    );
    const targetCategories = (activeFilter?.categories ?? []) as readonly string[];

    return exerciseLibrary.filter((exercise) => {
      const matchesSearch =
        !query ||
        exercise.name.toLowerCase().includes(query) ||
        exercise.category.toLowerCase().includes(query) ||
        exercise.muscleGroups.some((group) =>
          group.toLowerCase().includes(query),
        );
      const matchesCategory =
        targetCategories.length === 0 ||
        targetCategories.includes(exercise.category);

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, searchQuery]);

  const displayedExercises = filteredExercises.slice(0, visibleCount);

  function toDraft(plan: WorkoutPlan): WorkoutPlanDraft {
    return {
      title: plan.title,
      goal: plan.goal,
      exercises: plan.exercises.map((ex, index) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        note: ex.note,
        orderIndex: ex.orderIndex ?? index + 1,
      })),
    };
  }

  async function handlePersistPlan(plan: WorkoutPlan) {
    await updatePlan.mutateAsync({ planId: plan.id, draft: toDraft(plan) });
  }

  async function handleDeletePlan(planId: number) {
    await deletePlan.mutateAsync(planId);
  }

  async function handleDuplicatePlan(plan: WorkoutPlan) {
    await createPlan.mutateAsync({
      ...toDraft(plan),
      title: `${plan.title} (Bản sao)`,
    });
  }

  async function handleCreatePlan(draft: WorkoutPlanDraft) {
    await createPlan.mutateAsync(draft);
    setActiveView("list");
  }

  function handleAddLibraryExercise(name: string) {
    setExternalExerciseToAdd(name);
    setActiveView("create");
  }

  function resetLibraryList() {
    setVisibleCount(5);
  }

  return (
    <PermissionGuard allowedRoles={["pt"]}>
      <WorkspaceShell
        description="Tạo, chỉnh và sắp xếp giáo án cho hội viên."
        role="pt"
        title="Thiết kế giáo án"
      >
        <div className="space-y-5">
          <TrainingMemberContext
            data={memberQuery.data}
            isLoading={memberQuery.isLoading}
          />

          {memberQuery.error ? (
            <StateBlock
              description="Kiểm tra quyền phụ trách hội viên trước khi tạo giáo án."
              title={
                memberQuery.error instanceof Error
                  ? memberQuery.error.message
                  : "Không thể tải hội viên."
              }
              tone="error"
            />
          ) : null}

          <section className="gm-panel overflow-hidden">
            <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Dumbbell aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Thiết kế giáo án
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    {activeView === "list"
                      ? "Giáo án của hội viên"
                      : "Tạo giáo án mới"}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <ViewButton
                  active={activeView === "list"}
                  icon={ListChecks}
                  label="Danh sách"
                  onClick={() => setActiveView("list")}
                />
                <ViewButton
                  active={activeView === "create"}
                  icon={Plus}
                  label="Tạo giáo án"
                  onClick={() => setActiveView("create")}
                />
              </div>
            </div>

            <div className="grid gap-3 border-t border-border/70 bg-background/50 p-5 sm:grid-cols-3">
              <SummaryMetric
                icon={ListChecks}
                label="Giáo án"
                value={String(plansCount)}
              />
              <SummaryMetric
                icon={Dumbbell}
                label="Bài tập"
                value={String(totalExercisesCount)}
              />
              <SummaryMetric
                icon={Sparkles}
                label="Đang mở"
                value={latestPlan?.title ?? "Chưa có"}
              />
            </div>
          </section>

          {activeView === "list" ? (
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <main className="gm-panel min-w-0 p-5">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                      Giáo án
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                      Giáo án đang có
                    </h3>
                  </div>
                  <Button
                    className="min-h-11 rounded-full bg-primary px-5 text-primary-foreground hover:brightness-95 active:scale-[0.98]"
                    onClick={() => setActiveView("create")}
                    type="button"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Tạo giáo án
                  </Button>
                </div>

                <WorkoutPlanList
                  error={plansQuery.error instanceof Error ? plansQuery.error : null}
                  isLoading={plansQuery.isLoading}
                  mediaMode="coach"
                  plans={plansQuery.data}
                  onPersistPlan={handlePersistPlan}
                  onDeletePlan={handleDeletePlan}
                  onDuplicatePlan={handleDuplicatePlan}
                />
              </main>

              <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                <BuilderPrompt onCreate={() => setActiveView("create")} />
                <WorkoutLibraryPanel
                  activeCategory={activeCategory}
                  displayedExercises={displayedExercises}
                  filteredCount={filteredExercises.length}
                  onAddExercise={handleAddLibraryExercise}
                  onCategoryChange={(category) => {
                    setActiveCategory(category);
                    resetLibraryList();
                  }}
                  onLoadMore={() => setVisibleCount((count) => count + 5)}
                  onSearchChange={(value) => {
                    setSearchQuery(value);
                    resetLibraryList();
                  }}
                  searchQuery={searchQuery}
                  visibleCount={visibleCount}
                />
              </aside>
            </section>
          ) : (
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <main className="min-w-0">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    className="w-fit rounded-full border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
                    onClick={() => setActiveView("list")}
                    type="button"
                    variant="outline"
                  >
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Danh sách
                  </Button>
                  <p className="text-sm font-medium text-muted-foreground">
                    Preset, kiểm tra dữ liệu và thao tác lưu vẫn giữ nguyên.
                  </p>
                </div>

                <WorkoutPlanForm
                  isPending={createPlan.isPending}
                  onSubmit={handleCreatePlan}
                  externalExerciseToAdd={externalExerciseToAdd}
                  onExternalExerciseAdded={() => setExternalExerciseToAdd(undefined)}
                />

                {createPlan.error ? (
                  <StateBlock
                    className="mt-4"
                    description="Kiểm tra quyền phụ trách hội viên và dữ liệu bài tập."
                    title={
                      createPlan.error instanceof Error
                        ? createPlan.error.message
                        : "Không thể lưu giáo án."
                    }
                    tone="error"
                  />
                ) : null}
              </main>

              <aside className="xl:sticky xl:top-24 xl:self-start">
                <WorkoutLibraryPanel
                  activeCategory={activeCategory}
                  displayedExercises={displayedExercises}
                  filteredCount={filteredExercises.length}
                  onAddExercise={handleAddLibraryExercise}
                  onCategoryChange={(category) => {
                    setActiveCategory(category);
                    resetLibraryList();
                  }}
                  onLoadMore={() => setVisibleCount((count) => count + 5)}
                  onSearchChange={(value) => {
                    setSearchQuery(value);
                    resetLibraryList();
                  }}
                  searchQuery={searchQuery}
                  visibleCount={visibleCount}
                />
              </aside>
            </section>
          )}
        </div>
      </WorkspaceShell>
    </PermissionGuard>
  );
}

function ViewButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition active:scale-[0.98] ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </button>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-base font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function BuilderPrompt({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="gm-panel p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Tạo giáo án mới
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Chọn bối cảnh, áp preset, chỉnh bài và lưu.
          </p>
        </div>
      </div>
      <Button
        className="mt-5 min-h-11 w-full rounded-full bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
        onClick={onCreate}
        type="button"
      >
        <Plus aria-hidden="true" className="size-4" />
        Mở builder
      </Button>
    </section>
  );
}

function WorkoutLibraryPanel({
  activeCategory,
  displayedExercises,
  filteredCount,
  onAddExercise,
  onCategoryChange,
  onLoadMore,
  onSearchChange,
  searchQuery,
  visibleCount,
}: {
  activeCategory: ExerciseFilter;
  displayedExercises: typeof exerciseLibrary;
  filteredCount: number;
  onAddExercise: (name: string) => void;
  onCategoryChange: (category: ExerciseFilter) => void;
  onLoadMore: () => void;
  onSearchChange: (value: string) => void;
  searchQuery: string;
  visibleCount: number;
}) {
  return (
    <section className="gm-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Thư viện
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Thư viện bài tập
          </h3>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpen aria-hidden="true" className="size-4" />
        </span>
      </div>

      <label className="relative mt-4 block">
        <span className="sr-only">Tìm bài tập</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          className="gm-field min-h-11 w-full pl-10 pr-3 text-sm text-foreground transition placeholder:text-muted-foreground"
          placeholder="Tìm squat, bench..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {exerciseFilters.map((filter) => {
          const isActive = activeCategory === filter.label;

          return (
            <button
              className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold transition active:scale-[0.98] ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground hover:bg-muted"
              }`}
              key={filter.label}
              onClick={() => onCategoryChange(filter.label)}
              type="button"
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {displayedExercises.length > 0 ? (
          displayedExercises.map((exercise) => (
            <ExerciseLibraryItem
              key={exercise.id}
              name={exercise.name}
              tags={exercise.muscleGroups}
              onAdd={() => onAddExercise(exercise.name)}
            />
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Không có bài phù hợp.
          </p>
        )}
      </div>

      {filteredCount > visibleCount ? (
        <Button
          className="mt-4 min-h-11 w-full rounded-full border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
          onClick={onLoadMore}
          type="button"
          variant="outline"
        >
          Xem thêm {filteredCount - visibleCount}
        </Button>
      ) : null}
    </section>
  );
}

function ExerciseLibraryItem({
  name,
  onAdd,
  tags,
}: {
  name: string;
  onAdd: () => void;
  tags: string[];
}) {
  const asset = getWorkoutAssetForExercise(name);

  return (
    <article className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-2.5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
        <img
          alt={`Minh họa ${name}`}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          src={asset.src}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {tags.slice(0, 2).join(" · ")}
        </p>
      </div>
      <Button
        aria-label={`Thêm ${name}`}
        className="size-9 shrink-0 rounded-full border-border bg-card p-0 text-primary hover:bg-primary/10 active:scale-[0.95]"
        onClick={onAdd}
        type="button"
        variant="outline"
      >
        <Plus aria-hidden="true" className="size-4" />
      </Button>
    </article>
  );
}
