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
        description="Xem giáo án luyện tập do PT phụ trách tạo cho bạn."
        role="member"
        title="Giáo án của tôi"
      >
        <section className="space-y-4">
          <div className="rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              Chế độ xem hội viên
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#191b23]">
              Theo sát giáo án hiện tại
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#595e6d]">
              Thay đổi giáo án do PT quản lý. Liên hệ lễ tân hoặc PT nếu bài tập
              chưa phù hợp.
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
        description="Xem phản hồi huấn luyện từ PT phụ trách."
        role="member"
        title="Ghi chú PT"
      >
        <section className="space-y-4">
          <div className="rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              Chế độ xem hội viên
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#191b23]">
              Phản hồi huấn luyện
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#595e6d]">
              Ghi chú được PT tạo sau đánh giá, buổi tập hoặc trao đổi phục hồi.
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
