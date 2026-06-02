"use client"

import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import {
  useMemberTrainerNotes,
  useMemberWorkoutPlans,
} from "@/features/pt-training/api/pt-training.queries"
import {
  TrainerNoteList,
  TrainerNoteListHeader,
} from "@/features/pt-training/components/TrainerNoteList"
import {
  WorkoutPlanList,
  WorkoutPlanListHeader,
} from "@/features/pt-training/components/WorkoutPlanList"

const demoMemberId = 101

export function MemberWorkoutWorkspace() {
  const plansQuery = useMemberWorkoutPlans(demoMemberId)

  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Review the workout plan assigned by your coach."
        role="member"
        title="My workout plan"
      >
        <section className="space-y-4">
          <div className="rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0058be]">
              Read-only member view
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#191b23]">
              Follow your current coaching plan
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#595e6d]">
              Workout changes are managed by your PT. Message the front desk or
              coach if something feels off.
            </p>
          </div>
          <WorkoutPlanListHeader />
          <WorkoutPlanList
            error={plansQuery.error instanceof Error ? plansQuery.error : null}
            isLoading={plansQuery.isLoading}
            plans={plansQuery.data}
          />
        </section>
      </WorkspaceShell>
    </PermissionGuard>
  )
}

export function MemberTrainerNotesWorkspace() {
  const notesQuery = useMemberTrainerNotes(demoMemberId)

  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Review coaching feedback from your trainer."
        role="member"
        title="Trainer notes"
      >
        <section className="space-y-4">
          <div className="rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0058be]">
              Read-only member view
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#191b23]">
              Coaching feedback
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#595e6d]">
              Notes are written by your assigned PT after assessment, training,
              or recovery check-ins.
            </p>
          </div>
          <TrainerNoteListHeader />
          <TrainerNoteList
            error={notesQuery.error instanceof Error ? notesQuery.error : null}
            isLoading={notesQuery.isLoading}
            notes={notesQuery.data}
          />
        </section>
      </WorkspaceShell>
    </PermissionGuard>
  )
}
