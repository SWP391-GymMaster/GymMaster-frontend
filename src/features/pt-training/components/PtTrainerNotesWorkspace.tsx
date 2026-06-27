"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { NotebookPen, Plus } from "lucide-react"

import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"
import {
  useCreateMemberTrainerNote,
  useDeleteMemberTrainerNote,
  useMemberTrainerNotes,
  useUpdateMemberTrainerNote,
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
  const updateNote = useUpdateMemberTrainerNote(validMemberId ?? 0)
  const deleteNote = useDeleteMemberTrainerNote(validMemberId ?? 0)

  const [activeView, setActiveView] = useState<"list" | "create">("list")

  async function handleCreateNote(draft: TrainerNoteDraft) {
    await createNote.mutateAsync(draft)
    setActiveView("list")
  }

  async function handleUpdateNote(noteId: number, content: string) {
    await updateNote.mutateAsync({ noteId, draft: { content } })
  }

  async function handleDeleteNote(noteId: number) {
    await deleteNote.mutateAsync(noteId)
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

          <section>
            <NoteMetric icon={NotebookPen} label="Ghi chú" value={String(notesQuery.data?.length ?? 0)} />
          </section>

          {activeView === "list" ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <TrainerNoteListHeader />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Xem lịch sử và cue luyện tập chi tiết của hội viên.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveView("create")}
                  className="rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 active:scale-[0.98]"
                >
                  <Plus className="mr-2 size-4" />
                  Thêm ghi chú mới
                </Button>
              </div>

              <div className="mt-5">
                <TrainerNoteList
                  error={notesQuery.error instanceof Error ? notesQuery.error : null}
                  isLoading={notesQuery.isLoading}
                  notes={notesQuery.data}
                  onUpdate={handleUpdateNote}
                  onDelete={handleDeleteNote}
                />
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Coach Notes
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    Thêm ghi chú huấn luyện
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ghi lại các đánh giá kỹ thuật và ghi chú điều chỉnh qua từng buổi tập.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveView("list")}
                  variant="outline"
                  className="rounded-xl border-border hover:bg-muted text-xs font-semibold"
                >
                  ← Quay lại danh sách ghi chú
                </Button>
              </div>

              <div className="mt-4 max-w-2xl">
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
              </div>
            </section>
          )}
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
