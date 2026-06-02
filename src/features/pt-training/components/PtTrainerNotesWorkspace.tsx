"use client"

import { useParams } from "next/navigation"
import { MessageSquareText, NotebookPen, ShieldCheck } from "lucide-react"

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
            <NoteMetric icon={NotebookPen} label="Ghi chú" value={String(notesQuery.data?.length ?? 0)} />
            <NoteMetric icon={MessageSquareText} label="Cue kỹ thuật" value="3 mục" />
            <NoteMetric icon={ShieldCheck} label="Theo dõi" value="Active" />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
            <section className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Coach Notes
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  Thêm ghi chú huấn luyện
                </h2>
              </div>
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

            <section className="space-y-3">
              <TrainerNoteListHeader />
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

function NoteMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof NotebookPen
  label: string
  value: string
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </div>
    </section>
  )
}
