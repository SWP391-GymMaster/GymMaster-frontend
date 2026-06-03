"use client"

import { useParams } from "next/navigation"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Filter,
  MoreHorizontal,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { Button } from "@/components/ui/button"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"
import {
  useCreateMemberWorkoutPlan,
  useMemberWorkoutPlans,
} from "@/features/pt-training/api/pt-training.queries"
import { TrainingMemberContext } from "@/features/pt-training/components/TrainingMemberContext"
import { WorkoutPlanForm } from "@/features/pt-training/components/WorkoutPlanForm"
import {
  WorkoutPlanList,
  WorkoutPlanListHeader,
} from "@/features/pt-training/components/WorkoutPlanList"
import {
  getWorkoutAssetForExercise,
  getWorkoutCategoryLabel,
} from "@/features/pt-training/data/workout-assets"
import type { WorkoutPlanDraft } from "@/features/pt-training/types/pt-training.types"

const libraryPreview = [
  {
    name: "Back Squat",
    tags: ["Chân", "Mông", "Lưng dưới"],
  },
  {
    name: "Bench Press",
    tags: ["Ngực", "Vai trước", "Tay sau"],
  },
  {
    name: "Deadlift",
    tags: ["Lưng", "Mông", "Chân sau"],
  },
  {
    name: "Lat Pulldown",
    tags: ["Lưng", "Tay trước"],
  },
  {
    name: "Overhead Press",
    tags: ["Vai", "Tay sau", "Core"],
  },
]

export function PtWorkoutPlanWorkspace() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)
  const validMemberId = Number.isFinite(memberId) && memberId > 0 ? memberId : null
  const memberQuery = useMember360Data(validMemberId)
  const plansQuery = useMemberWorkoutPlans(validMemberId)
  const createPlan = useCreateMemberWorkoutPlan(validMemberId ?? 0)

  const plansCount = plansQuery.data?.length ?? 0
  const latestPlan = plansQuery.data?.[0]
  const latestExercisesCount = latestPlan?.exercises.length ?? 0

  async function handleCreatePlan(draft: WorkoutPlanDraft) {
    await createPlan.mutateAsync(draft)
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

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Workout Builder
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  Thiết kế giáo án có minh họa bài tập
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  PT chọn preset, kiểm tra thư viện bài tập và xem ảnh minh họa ngay trong workspace trước khi lưu giáo án.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  className="rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
                  type="button"
                  variant="outline"
                >
                  Hủy
                </Button>
                <Button
                  className="rounded-xl bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]"
                  type="button"
                >
                  Tiếp tục
                  <ArrowRight aria-hidden="true" className="size-4" />
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
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <NotebookPen aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      Thông tin giáo án
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Form bên phải vẫn giữ toàn bộ logic tạo giáo án, preset và submit hiện tại.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <SideField label="Tên giáo án" value="Hypertrophy Program · Phase 1" />
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <SideField label="Tuần" value="04 tuần" />
                    <SideField label="Mục tiêu" value="Tăng cơ" />
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-primary"
                      />
                      <p className="text-sm leading-6 text-foreground">
                        Gợi ý: 4-6 buổi/tuần, tập trung nhóm cơ chính và progressive overload.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      Thư viện bài tập
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Xem nhanh ảnh minh họa trước khi thêm vào giáo án.
                    </p>
                  </div>
                  <Button
                    className="size-10 rounded-xl border-border bg-card text-foreground hover:bg-muted"
                    type="button"
                    variant="outline"
                  >
                    <Filter aria-hidden="true" className="size-4" />
                  </Button>
                </div>

                <label className="relative mt-4 block">
                  <span className="sr-only">Tìm bài tập</span>
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    className="min-h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                    placeholder="Tìm bài tập: squat, bench press..."
                    readOnly
                  />
                </label>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {["Tất cả", "Ngực", "Lưng", "Vai", "Chân", "Core"].map((tab, index) => (
                    <button
                      className={`min-h-9 shrink-0 rounded-full px-3 text-sm font-semibold transition ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background text-foreground hover:bg-muted"
                      }`}
                      key={tab}
                      type="button"
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-3">
                  {libraryPreview.map((exercise) => (
                    <ExerciseLibraryItem
                      key={exercise.name}
                      name={exercise.name}
                      tags={exercise.tags}
                    />
                  ))}
                </div>

                <Button
                  className="mt-4 min-h-11 w-full rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
                  type="button"
                  variant="outline"
                >
                  Xem thêm bài tập
                </Button>
              </section>
            </aside>

            <main className="min-w-0 space-y-6">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      Plan Builder
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                      Tạo giáo án mới
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Wizard bên dưới xử lý preset, môi trường tập và danh sách bài tập; cột trái chỉ đóng vai trò preview nhanh.
                    </p>
                  </div>
                  <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <Sparkles aria-hidden="true" className="size-4 text-primary" />
                    Clean stepper
                  </div>
                </div>

                <div className="mt-5">
                  <WorkoutPlanForm
                    isPending={createPlan.isPending}
                    onSubmit={handleCreatePlan}
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

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <WorkoutPlanListHeader />
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Giáo án đã lưu có ảnh minh họa để PT kiểm tra lại bài tập nhanh hơn, nhưng không làm layout quá nặng.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:w-[360px]">
                    <MiniStat label="Giáo án" value={String(plansCount)} />
                    <MiniStat label="Bài tập" value={String(latestExercisesCount)} />
                    <MiniStat label="Tần suất" value="4 buổi" />
                  </div>
                </div>

                <div className="mt-5">
                  <WorkoutPlanList
                    error={plansQuery.error instanceof Error ? plansQuery.error : null}
                    isLoading={plansQuery.isLoading}
                    mediaMode="coach"
                    plans={plansQuery.data}
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
            </main>
          </section>
        </div>
      </WorkspaceShell>
    </PermissionGuard>
  )
}

function BuilderStep({
  active,
  index,
  label,
  title,
}: {
  active?: boolean
  index: number
  label: string
  title: string
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
  )
}

function SideField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function ExerciseLibraryItem({
  name,
  tags,
}: {
  name: string
  tags: string[]
}) {
  const asset = getWorkoutAssetForExercise(name)

  return (
    <article className="flex items-center gap-3 rounded-xl border border-border bg-background p-2 transition hover:border-primary/40 hover:bg-primary/5">
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
        className="h-9 rounded-xl border-border bg-card px-3 text-primary hover:bg-primary/10"
        type="button"
        variant="outline"
      >
        <Plus aria-hidden="true" className="size-4" />
        Thêm
      </Button>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function CoachWorkflowCard({
  description,
  icon: Icon,
  label,
  title,
}: {
  description: string
  icon: LucideIcon
  label: string
  title: string
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
  )
}
