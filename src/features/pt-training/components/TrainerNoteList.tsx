"use client"

import { NotebookPen } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import type { TrainerNote } from "@/features/pt-training/types/pt-training.types"

type TrainerNoteListProps = {
  error?: Error | null
  isLoading?: boolean
  notes?: TrainerNote[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function TrainerNoteList({
  error,
  isLoading,
  notes,
}: TrainerNoteListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="trainer-note-loading">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="h-28 animate-pulse rounded-2xl border border-border bg-card"
            key={index}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <StateBlock
        description="Tải lại workspace và kiểm tra hội viên này có thuộc danh sách của bạn."
        title={error.message}
        tone="error"
      />
    )
  }

  if (!notes?.length) {
    return (
      <StateBlock
        description="Thêm ghi chú ngắn sau buổi đánh giá, tập luyện hoặc trao đổi phục hồi."
        title="Chưa có ghi chú PT"
        tone="empty"
      />
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((note, index) => (
        <article
          className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          key={note.id}
        >
          <div className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {formatDate(note.createdAt)}
                </p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  PT note
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground">
                {note.content}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export function TrainerNoteListHeader() {
  return (
    <div className="flex items-center gap-2">
      <NotebookPen aria-hidden="true" className="size-5 text-primary" />
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Ghi chú PT
      </h2>
    </div>
  )
}
