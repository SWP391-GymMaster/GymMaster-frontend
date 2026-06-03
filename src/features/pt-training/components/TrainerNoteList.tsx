"use client"

import { AlertCircle, CheckCircle2, NotebookPen } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import type { TrainerNote } from "@/features/pt-training/types/pt-training.types"
import { cn } from "@/lib/utils"

type TrainerNoteListProps = {
  error?: Error | null
  isLoading?: boolean
  notes?: TrainerNote[]
  variant?: "default" | "member"
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
  variant = "default",
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
        description="Ghi chú từ PT sẽ xuất hiện tại đây sau buổi đánh giá hoặc tập luyện."
        title="Chưa có ghi chú PT"
        tone="empty"
      />
    )
  }

  return (
    <div className={cn("space-y-4", variant === "member" && "relative")}>
      {variant === "member" ? (
        <div className="absolute bottom-8 left-5 top-8 w-px bg-border" />
      ) : null}

      {notes.map((note, index) => (
        <article
          className={cn(
            "relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
            variant === "member" && "ml-4",
          )}
          key={note.id}
        >
          <div className="flex gap-4">
            <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-4 ring-background">
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

              {variant === "member" ? (
                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div>
                    <p className="whitespace-pre-line text-base leading-7 text-foreground">
                      {note.content}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Action cue
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 aria-hidden="true" className="size-4 text-primary" />
                        Khởi động vai trước buổi tập
                      </span>
                      <span className="flex items-center gap-2">
                        <AlertCircle aria-hidden="true" className="size-4 text-orange-500" />
                        Ưu tiên form hơn mức tạ
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground">
                  {note.content}
                </p>
              )}
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
