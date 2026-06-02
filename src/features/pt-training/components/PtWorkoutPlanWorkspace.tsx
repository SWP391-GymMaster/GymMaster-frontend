"use client"

import { useParams } from "next/navigation"

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
        description="Build assigned member training plans with clear exercise guidance."
        role="pt"
        title="Workout plan builder"
      >
        <div className="space-y-5">
          <TrainingMemberContext
            data={memberQuery.data}
            isLoading={memberQuery.isLoading}
          />

          {memberQuery.error ? (
            <StateBlock
              description="Confirm this member is assigned to your coaching workspace."
              title={
                memberQuery.error instanceof Error
                  ? memberQuery.error.message
                  : "Unable to load member."
              }
              tone="error"
            />
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <section>
              <h2 className="mb-3 text-lg font-black tracking-tight text-[#191b23]">
                Create plan
              </h2>
              <WorkoutPlanForm
                isPending={createPlan.isPending}
                onSubmit={handleCreatePlan}
              />
              {createPlan.error ? (
                <StateBlock
                  className="mt-3"
                  description="Check assignment ownership and exercise rows before saving again."
                  title={
                    createPlan.error instanceof Error
                      ? createPlan.error.message
                      : "Unable to save workout plan."
                  }
                  tone="error"
                />
              ) : null}
            </section>

            <section>
              <div className="mb-3">
                <WorkoutPlanListHeader />
              </div>
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
