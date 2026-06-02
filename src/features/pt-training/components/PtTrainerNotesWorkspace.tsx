"use client"

import { useParams } from "next/navigation"

import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { StateBlock } from "@/components/feedback/StateBlock"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"
import {
  useCreateMemberTrainerNote,
  useMemberTrainerNotes,
} from "@/features/pt-training/api/pt-training.queries"
import { TrainerNoteForm } from "@/features/pt-training/components/TrainerNoteForm"
import {
  TrainerNoteList,
  TrainerNoteListHeader,
} from "@/features/pt-training/components/TrainerNoteList"
import { TrainingMemberContext } from "@/features/pt-training/components/TrainingMemberContext"
import type { TrainerNoteDraft } from "@/features/pt-training/types/pt-training.types"

export function PtTrainerNotesWorkspace() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)
  const validMemberId = Number.isFinite(memberId) && memberId > 0 ? memberId : null
  const memberQuery = useMember360Data(validMemberId)
  const notesQuery = useMemberTrainerNotes(validMemberId)
  const createNote = useCreateMemberTrainerNote(validMemberId ?? 0)

  async function handleCreateNote(draft: TrainerNoteDraft) {
    await createNote.mutateAsync(draft)
  }

  return (
    <PermissionGuard allowedRoles={["pt"]}>
      <WorkspaceShell
        description="Ghi lại chỉnh sửa kỹ thuật, cue tiến độ và lưu ý phục hồi cho hội viên."
        role="pt"
        title="Ghi chú PT"
      >
        <div className="space-y-5">
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

          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <section>
              <h2 className="mb-3 text-lg font-black tracking-tight text-[#191b23]">
                Thêm ghi chú
              </h2>
              <TrainerNoteForm
                isPending={createNote.isPending}
                onSubmit={handleCreateNote}
              />
              {createNote.error ? (
                <StateBlock
                  className="mt-3"
                  description="Kiểm tra quyền phụ trách hội viên và nội dung ghi chú trước khi lưu lại."
                  title={
                    createNote.error instanceof Error
                      ? createNote.error.message
                      : "Không thể lưu ghi chú PT."
                  }
                  tone="error"
                />
              ) : null}
            </section>

            <section>
              <div className="mb-3">
                <TrainerNoteListHeader />
              </div>
              <TrainerNoteList
                error={notesQuery.error instanceof Error ? notesQuery.error : null}
                isLoading={notesQuery.isLoading}
                notes={notesQuery.data}
              />
            </section>
          </div>
        </div>
      </WorkspaceShell>
    </PermissionGuard>
  )
}
