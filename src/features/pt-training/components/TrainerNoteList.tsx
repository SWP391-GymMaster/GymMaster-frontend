"use client"

import { useState } from "react"
import { NotebookPen, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TrainerNote } from "@/features/pt-training/types/pt-training.types"
import { formatVnDateTime } from "@/lib/date/vn-time"
import { cn } from "@/lib/utils"

type TrainerNoteListProps = {
  error?: Error | null
  isLoading?: boolean
  notes?: TrainerNote[]
  variant?: "default" | "member"
  // Coach-only management. When omitted (e.g. member view) the actions hide.
  onUpdate?: (noteId: number, content: string) => Promise<void>
  onDelete?: (noteId: number) => Promise<void>
}

function formatDate(value: string) {
  return formatVnDateTime(value, { dateStyle: "medium", timeStyle: "short" })
}

export function TrainerNoteList({
  error,
  isLoading,
  notes,
  variant = "default",
  onUpdate,
  onDelete,
}: TrainerNoteListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="trainer-note-loading">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="gm-panel h-28 animate-pulse"
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
        <TrainerNoteItem
          key={note.id}
          index={index}
          note={note}
          variant={variant}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function TrainerNoteItem({
  note,
  index,
  variant,
  onUpdate,
  onDelete,
}: {
  note: TrainerNote
  index: number
  variant: "default" | "member"
  onUpdate?: (noteId: number, content: string) => Promise<void>
  onDelete?: (noteId: number) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(note.content)
  const [isSaving, setIsSaving] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canManage = variant !== "member" && Boolean(onUpdate || onDelete)

  async function handleSave() {
    const trimmed = draft.trim()
    if (trimmed.length < 5) {
      toast.error("Ghi chú cần tối thiểu 5 ký tự.")
      return
    }
    if (trimmed === note.content) {
      setIsEditing(false)
      return
    }
    try {
      setIsSaving(true)
      await onUpdate?.(note.id, trimmed)
      toast.success("Đã cập nhật ghi chú!")
      setIsEditing(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật ghi chú.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await onDelete?.(note.id)
      toast.success("Đã xóa ghi chú!")
      setIsConfirmOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa ghi chú.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <article
      className={cn(
        "gm-interactive-card relative p-5",
        variant === "member" && "ml-4",
      )}
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
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                PT note
              </span>
              {canManage && !isEditing ? (
                <>
                  {onUpdate ? (
                    <Button
                      aria-label="Sửa ghi chú"
                      className="size-8 rounded-lg border-border bg-card text-foreground hover:bg-muted active:scale-[0.95]"
                      onClick={() => {
                        setDraft(note.content)
                        setIsEditing(true)
                      }}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Button>
                  ) : null}
                  {onDelete ? (
                    <Button
                      aria-label="Xóa ghi chú"
                      className="size-8 rounded-lg border-destructive/20 bg-card text-destructive hover:bg-destructive/10 active:scale-[0.95]"
                      onClick={() => setIsConfirmOpen(true)}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-3 space-y-3">
              <textarea
                aria-label="Nội dung ghi chú"
                autoFocus
                className="gm-field min-h-28 w-full px-4 py-3 text-sm leading-6 text-foreground transition"
                onChange={(e) => setDraft(e.target.value)}
                value={draft}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  className="rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
                  disabled={isSaving}
                  onClick={handleSave}
                  type="button"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  className="rounded-xl border-border hover:bg-muted"
                  disabled={isSaving}
                  onClick={() => {
                    setDraft(note.content)
                    setIsEditing(false)
                  }}
                  type="button"
                  variant="outline"
                >
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <p
              className={cn(
                "mt-3 whitespace-pre-line leading-6 text-foreground",
                variant === "member" ? "text-base leading-7" : "text-sm",
              )}
            >
              {note.content}
            </p>
          )}
        </div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xóa ghi chú này?</DialogTitle>
            <DialogDescription>
              Ghi chú sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              className="rounded-xl border-border hover:bg-muted"
              disabled={isDeleting}
              onClick={() => setIsConfirmOpen(false)}
              type="button"
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90 active:scale-[0.98]"
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
            >
              {isDeleting ? "Đang xóa..." : "Xóa ghi chú"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
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
