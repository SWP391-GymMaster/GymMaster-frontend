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
  return new Intl.DateTimeFormat("en", {
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
            className="h-28 animate-pulse rounded-xl border border-[#c2c6d6] bg-white"
            key={index}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <StateBlock
        description="Refresh the workspace and confirm this member is assigned to you."
        title={error.message}
        tone="error"
      />
    )
  }

  if (!notes?.length) {
    return (
      <StateBlock
        description="Add a short note after assessment, workout, or recovery discussion."
        title="No trainer notes yet"
        tone="empty"
      />
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <article
          className="rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg"
          key={note.id}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#595e6d]">
            {formatDate(note.createdAt)}
          </p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#191b23]">
            {note.content}
          </p>
        </article>
      ))}
    </div>
  )
}

export function TrainerNoteListHeader() {
  return (
    <div className="flex items-center gap-2">
      <NotebookPen aria-hidden="true" className="size-5 text-[#0058be]" />
      <h2 className="text-lg font-black tracking-tight text-[#191b23]">
        Trainer notes
      </h2>
    </div>
  )
}
