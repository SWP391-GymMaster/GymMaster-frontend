"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Lightbulb, Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { trainerNoteSchema } from "@/features/pt-training/schemas/pt-training.schemas"
import type { TrainerNoteFormValues } from "@/features/pt-training/schemas/pt-training.schemas"
import type { TrainerNoteDraft } from "@/features/pt-training/types/pt-training.types"

type TrainerNoteFormProps = {
  isPending?: boolean
  onSubmit: (draft: TrainerNoteDraft) => Promise<void>
}

export function TrainerNoteForm({ isPending, onSubmit }: TrainerNoteFormProps) {
  const form = useForm<TrainerNoteFormValues>({
    resolver: zodResolver(trainerNoteSchema),
    defaultValues: {
      content: "",
    },
  })

  async function handleSubmit(values: TrainerNoteFormValues) {
    await onSubmit({ content: values.content.trim() })
    form.reset()
    toast.success("Đã lưu ghi chú PT")
  }

  return (
    <form
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lightbulb aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Gợi ý nội dung</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Ghi cue kỹ thuật, lỗi cần sửa, mức RPE, phản hồi phục hồi hoặc mục tiêu buổi tiếp theo.
          </p>
        </div>
      </div>

      <label
        className="mt-5 block text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
        htmlFor="trainer-note-content"
      >
        Ghi chú huấn luyện
      </label>
      <textarea
        className="mt-2 min-h-44 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
        id="trainer-note-content"
        placeholder="Ví dụ: Giữ vai ổn định khi đẩy ngực, giảm tốc độ eccentric ở set cuối..."
        {...form.register("content")}
      />
      {form.formState.errors.content ? (
        <p className="mt-2 text-sm font-medium text-destructive">
          {form.formState.errors.content.message}
        </p>
      ) : null}

      <Button
        className="mt-4 min-h-12 w-full rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
        data-testid="trainer-note-submit-button"
        disabled={isPending}
        type="submit"
      >
        <Send aria-hidden="true" className="size-4" />
        {isPending ? "Đang lưu ghi chú..." : "Lưu ghi chú"}
      </Button>
    </form>
  )
}
