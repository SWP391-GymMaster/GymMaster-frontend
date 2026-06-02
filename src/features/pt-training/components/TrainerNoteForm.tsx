"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
      className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <label
        className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500"
        htmlFor="trainer-note-content"
      >
        Ghi chú huấn luyện
      </label>
      <textarea
        className="mt-2 min-h-40 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm leading-6 text-zinc-950 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
        id="trainer-note-content"
        placeholder="Ghi lỗi kỹ thuật, cue tiến độ hoặc lời khuyên phục hồi."
        {...form.register("content")}
      />
      {form.formState.errors.content ? (
        <p className="mt-2 text-sm font-medium text-red-700">
          {form.formState.errors.content.message}
        </p>
      ) : null}

      <Button
        className="mt-4 min-h-12 w-full rounded-full bg-primary text-zinc-950 hover:brightness-95 active:scale-[0.98]"
        data-testid="trainer-note-submit-button"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Đang lưu ghi chú..." : "Lưu ghi chú"}
      </Button>
    </form>
  )
}
