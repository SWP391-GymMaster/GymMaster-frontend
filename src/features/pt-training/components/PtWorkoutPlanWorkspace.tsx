"use client"

import { useParams } from "next/navigation"
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  NotebookPen,
  Plus,
  Sparkles,
} from "lucide-react"

import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { StateBlock } from "@/components/feedback/StateBlock"
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
import type { WorkoutPlanDraft } from "@/features/pt-training/types/pt-training.types"

export function PtWorkoutPlanWorkspace() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)
  const validMemberId = Number.isFinite(memberId) && memberId > 0 ? memberId : null
  const memberQuery = useMember360Data(validMemberId)
  const plansQuery = useMemberWorkoutPlans(validMemberId)
  const createPlan = useCreateMemberWorkoutPlan(validMemberId ?? 0)

  const plansCount = plansQuery.data?.length ?? 0
  const latestPlan = plansQuery.data?.[0]

  async function handleCreatePlan(draft: WorkoutPlanDraft) {
    await createPlan.mutateAsync(draft)
  }

  return (
    <PermissionGuard allowedRoles={["pt"]}>
      <WorkspaceShell
        description="Thiết kế giáo án cho hội viên được phân công với bài tập, số hiệp và cue rõ ràng."
        role="pt"
        title="Trình tạo giáo án"
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

          <section className="grid gap-4 md:grid-cols-3">
            <CoachWorkflowCard
              icon={Plus}
              label="Bước 1"
              title="Chọn bối cảnh"
              description="Gym, tại nhà, không dụng cụ hoặc mobility."
            />
            <CoachWorkflowCard
              icon={Dumbbell}
              label="Bước 2"
              title="Áp dụng preset"
              description="Full Body, Upper/Lower, PPL hoặc Arnold Split."
            />
            <CoachWorkflowCard
              icon={CalendarDays}
              label="Bước 3"
              title="Theo dõi tiến độ"
              description="Lưu giáo án và kiểm tra lịch sử đã tạo."
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <main className="min-w-0 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Plan Builder
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    Tạo giáo án mới
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Form được chia theo bước để PT tạo giáo án nhanh mà vẫn kiểm soát được preset, bài tập và cue kỹ thuật.
                  </p>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
                  <Sparkles aria-hidden="true" className="size-4 text-primary" />
                  Step-by-step builder
                </div>
              </div>

              <WorkoutPlanForm
                isPending={createPlan.isPending}
                onSubmit={handleCreatePlan}
              />

              {createPlan.error ? (
                <StateBlock
                  className="mt-3"
                  description="Kiểm tra quyền phụ trách hội viên và các dòng bài tập trước khi lưu lại."
                  title={
                    createPlan.error instanceof Error
                      ? createPlan.error.message
                      : "Không thể lưu giáo án."
                  }
                  tone="error"
                />
              ) : null}
            </main>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      Training History
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                      Giáo án hiện có
                    </h3>
                  </div>
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ClipboardList aria-hidden="true" className="size-5" />
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniStat label="Tổng giáo án" value={String(plansCount)} />
                  <MiniStat
                    label="Trạng thái"
                    value={plansCount > 0 ? "Active" : "Chưa có"}
                  />
                </div>

                {latestPlan ? (
                  <div className="mt-4 rounded-xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Gần nhất
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
                      {latestPlan.title}
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <WorkoutPlanListHeader />
                <div className="mt-4 max-h-[560px] overflow-y-auto pr-1">
                  <WorkoutPlanList
                    error={plansQuery.error instanceof Error ? plansQuery.error : null}
                    isLoading={plansQuery.isLoading}
                    plans={plansQuery.data}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold text-foreground">
                  Checklist trước khi lưu
                </p>
                <div className="mt-4 space-y-3">
                  <CoachChecklistItem label="Bối cảnh tập luyện đã đúng" />
                  <CoachChecklistItem label="Sets/reps phù hợp với mục tiêu" />
                  <CoachChecklistItem label="Cue kỹ thuật rõ ràng, dễ hiểu" />
                </div>
              </section>
            </aside>
          </section>
        </div>
      </WorkspaceShell>
    </PermissionGuard>
  )
}

function CoachWorkflowCard({
  description,
  icon: Icon,
  label,
  title,
}: {
  description: string
  icon: typeof NotebookPen
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
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function CoachChecklistItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 aria-hidden="true" className="size-4" />
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}
