"use client"

import { useParams } from "next/navigation"
import { CalendarDays, Dumbbell, NotebookPen, Plus } from "lucide-react"

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

          <div className="flex flex-col gap-6">
            <section className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Plan Builder
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  Tạo giáo án mới
                </h2>
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
            </section>

            <section className="space-y-3">
              <WorkoutPlanListHeader />
              <WorkoutPlanList
                error={plansQuery.error instanceof Error ? plansQuery.error : null}
                isLoading={plansQuery.isLoading}
                plans={plansQuery.data}
              />
            </section>
          </div>
        </div>
      </WorkspaceShell>
    </PermissionGuard>
  )
}

function CoachWorkflowCard({
  icon: Icon,
  label,
  title,
}: {
  icon: typeof NotebookPen
  label: string
  title: string
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {title}
          </p>
        </div>
      </div>
    </section>
  )
}
