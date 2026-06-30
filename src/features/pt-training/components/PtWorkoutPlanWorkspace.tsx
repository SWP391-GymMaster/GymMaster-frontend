"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  NotebookPen,
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
import {
  WorkoutPlanList,
  WorkoutPlanListHeader,
} from "@/features/pt-training/components/WorkoutPlanList";
import {
  getWorkoutAssetForExercise,
} from "@/features/pt-training/data/workout-assets";
import { exerciseLibrary } from "@/features/pt-training/data/exercise-library";
import type {
  WorkoutPlan,
  WorkoutPlanDraft,
} from "@/features/pt-training/types/pt-training.types";

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

  // Map a (possibly edited) plan to the backend draft shape used by PUT/POST.
  function toDraft(plan: WorkoutPlan): WorkoutPlanDraft {
    return {
      title: plan.title,
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

  const [activeView, setActiveView] = useState<"list" | "create">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [visibleCount, setVisibleCount] = useState(5);
  const [externalExerciseToAdd, setExternalExerciseToAdd] = useState<string | undefined>(undefined);

  const plansCount = plansQuery.data?.length ?? 0;
  const totalExercisesCount =
    plansQuery.data?.reduce((sum, plan) => sum + plan.exercises.length, 0) ?? 0;

  const categoryMapping: Record<string, string[]> = {
    "Tất cả": [],
    "Ngực": ["Chest"],
    "Lưng": ["Back"],
    "Vai": ["Shoulders"],
    "Chân": ["Legs", "Glutes"],
    "Core": ["Core"],
  };

  const filteredExercises = exerciseLibrary.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscleGroups.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const targetCategories = categoryMapping[activeCategory] || [];
    const matchesCategory = targetCategories.length === 0 || targetCategories.includes(exercise.category);

    return matchesSearch && matchesCategory;
  });

  const displayedExercises = filteredExercises.slice(0, visibleCount);

  async function handleCreatePlan(draft: WorkoutPlanDraft) {
    await createPlan.mutateAsync(draft);
    setActiveView("list");
  }

  return (
    <PermissionGuard allowedRoles={["pt"]}>
      <WorkspaceShell
        description="Tạo giáo án chi tiết cho hội viên, kèm preset, bài tập minh họa và cue kỹ thuật."
        role="pt"
        title="Thiết kế giáo án luyện tập"
      >
        <div className="space-y-6">
          <TrainingMemberContext
            data={memberQuery.data}
            isLoading={memberQuery.isLoading}
          />

          {memberQuery.error ? (
            <StateBlock
              description="Kiểm tra hội viên này có thuộc workspace huấn luyện của bạn."
              title={
                memberQuery.error instanceof Error
                  ? memberQuery.error.message
                  : "Không thể tải hội viên."
              }
              tone="error"
            />
          ) : null}

          {activeView === "list" ? (
            <div className="space-y-6">
              <section className="gm-panel p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <WorkoutPlanListHeader />
                    <p className="mt-2 text-sm leading-6 text-muted-foreground font-medium">
                      Danh sách giáo án đã thiết kế cho hội viên này. Bấm nút bên phải để bắt đầu tạo giáo án mới.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 sm:w-[360px] shrink-0">
                    <div className="grid grid-cols-2 gap-2">
                      <MiniStat label="Giáo án" value={String(plansCount)} />
                      <MiniStat
                        label="Bài tập"
                        value={String(totalExercisesCount)}
                      />
                    </div>
                    <Button
                      onClick={() => setActiveView("create")}
                      className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] font-bold"
                    >
                      <Plus className="mr-2 size-4" />
                      Tạo giáo án mới
                    </Button>
                  </div>
                </div>

                <div className="mt-5">
                  <WorkoutPlanList
                    error={
                      plansQuery.error instanceof Error
                        ? plansQuery.error
                        : null
                    }
                    isLoading={plansQuery.isLoading}
                    mediaMode="coach"
                    plans={plansQuery.data}
                    onPersistPlan={handlePersistPlan}
                    onDeletePlan={handleDeletePlan}
                    onDuplicatePlan={handleDuplicatePlan}
                  />
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <CoachWorkflowCard
                  description="Chọn môi trường, mục tiêu, split và preset."
                  icon={Plus}
                  label="Bước 1"
                  title="Thông tin"
                />
                <CoachWorkflowCard
                  description="Xem ảnh minh họa và cue trước khi lưu."
                  icon={Dumbbell}
                  label="Bước 2"
                  title="Bài tập"
                />
                <CoachWorkflowCard
                  description="Kiểm tra tổng bài, thời lượng và tần suất."
                  icon={CalendarDays}
                  label="Bước 3"
                  title="Tổng kết"
                />
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="gm-panel p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      Workout Builder
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                      Thiết kế giáo án có minh họa bài tập
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                      PT chọn preset, kiểm tra thư viện bài tập và xem ảnh minh họa
                      ngay trong workspace trước khi lưu giáo án.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setActiveView("list")}
                      className="rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
                      type="button"
                      variant="outline"
                    >
                      ← Quay lại danh sách giáo án
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  <BuilderStep
                    active
                    index={1}
                    label="Thông tin giáo án"
                    title="Mục tiêu & lịch tập"
                  />
                  <BuilderStep
                    index={2}
                    label="Xây dựng buổi tập"
                    title="Bài tập & cue"
                  />
                  <BuilderStep
                    index={3}
                    label="Tổng kết & lưu"
                    title="Kiểm tra lần cuối"
                  />
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
                <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                  <section className="gm-panel p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <NotebookPen aria-hidden="true" className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">
                          Thông tin giáo án
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Form bên phải vẫn giữ toàn bộ logic tạo giáo án, preset và
                          submit hiện tại.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-0.5 size-5 shrink-0 text-primary"
                          />
                          <p className="text-sm leading-6 text-foreground">
                            Gợi ý: 4-6 buổi/tuần, tập trung nhóm cơ chính và
                            progressive overload.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="gm-panel p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">
                          Thư viện bài tập
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Xem nhanh ảnh minh họa trước khi thêm vào giáo án.
                        </p>
                      </div>
                    </div>

                    <label className="relative mt-4 block">
                      <span className="sr-only">Tìm bài tập</span>
                      <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        className="gm-field min-h-11 w-full pl-10 pr-3 text-sm text-foreground transition placeholder:text-muted-foreground"
                        placeholder="Tìm bài tập: squat, bench press..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setVisibleCount(5);
                        }}
                      />
                    </label>

                    <div className="mt-4 flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {["Tất cả", "Ngực", "Lưng", "Vai", "Chân", "Core"].map(
                        (tab) => {
                          const isActive = activeCategory === tab;
                          return (
                            <button
                              className={`min-h-9 shrink-0 rounded-full px-3 text-sm font-semibold transition ${
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border bg-background text-foreground hover:bg-muted"
                              }`}
                              key={tab}
                              onClick={() => {
                                setActiveCategory(tab);
                                setVisibleCount(5);
                              }}
                              type="button"
                            >
                              {tab}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <div className="mt-4 grid gap-3">
                      {displayedExercises.length > 0 ? (
                        displayedExercises.map((exercise) => (
                          <ExerciseLibraryItem
                            key={exercise.id}
                            name={exercise.name}
                            tags={exercise.muscleGroups}
                            onAdd={() => setExternalExerciseToAdd(exercise.name)}
                          />
                        ))
                      ) : (
                        <p className="text-center py-4 text-sm text-muted-foreground">
                          Không tìm thấy bài tập phù hợp.
                        </p>
                      )}
                    </div>

                    {filteredExercises.length > visibleCount && (
                      <Button
                        className="mt-4 min-h-11 w-full rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
                        type="button"
                        variant="outline"
                        onClick={() => setVisibleCount((prev) => prev + 5)}
                      >
                        Xem thêm bài tập ({filteredExercises.length - visibleCount})
                      </Button>
                    )}
                  </section>
                </aside>

                <main className="min-w-0 space-y-6">
                  <section className="gm-panel p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                          Plan Builder
                        </p>
                        <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                          Tạo giáo án mới
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                          Wizard bên dưới xử lý preset, môi trường tập và danh sách
                          bài tập; cột trái chỉ đóng vai trò preview nhanh.
                        </p>
                      </div>
                      <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">
                        <Sparkles
                          aria-hidden="true"
                          className="size-4 text-primary"
                        />
                        Clean stepper
                      </div>
                    </div>

                    <div className="mt-5">
                      <WorkoutPlanForm
                        isPending={createPlan.isPending}
                        onSubmit={handleCreatePlan}
                        externalExerciseToAdd={externalExerciseToAdd}
                        onExternalExerciseAdded={() => setExternalExerciseToAdd(undefined)}
                      />
                    </div>

                    {createPlan.error ? (
                      <StateBlock
                        className="mt-4"
                        description="Kiểm tra quyền phụ trách hội viên và các dòng bài tập trước khi lưu lại."
                        title={
                          createPlan.error instanceof Error
                            ? createPlan.error.message
                            : "Không thể lưu giáo án."
                        }
                        tone="error"
                      />
                    ) : null}
                  </section>
                </main>
              </section>
            </div>
          )}
        </div>
      </WorkspaceShell>
    </PermissionGuard>
  );
}

function BuilderStep({
  active,
  index,
  label,
  title,
}: {
  active?: boolean;
  index: number;
  label: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground"
        }`}
      >
        {index}
      </span>
      <span className="min-w-0">
        <span
          className={`block text-xs font-semibold uppercase tracking-[0.1em] ${
            active ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-foreground">
          {title}
        </span>
      </span>
    </div>
  );
}

function ExerciseLibraryItem({ name, tags, onAdd }: { name: string; tags: string[]; onAdd: () => void }) {
  const asset = getWorkoutAssetForExercise(name);

  return (
    <article className="gm-interactive-card flex items-center gap-3 p-2">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        <img
          alt={`Minh họa ${name}`}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          src={asset.src}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Button
        className="h-9 rounded-xl border-border bg-card px-3 text-primary hover:bg-primary/10 font-bold active:scale-[0.95]"
        type="button"
        variant="outline"
        onClick={onAdd}
      >
        <Plus aria-hidden="true" className="size-4" />
        Thêm
      </Button>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="gm-panel-muted p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CoachWorkflowCard({
  description,
  icon: Icon,
  label,
  title,
}: {
  description: string;
  icon: LucideIcon;
  label: string;
  title: string;
}) {
  return (
    <section className="gm-panel p-5">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
