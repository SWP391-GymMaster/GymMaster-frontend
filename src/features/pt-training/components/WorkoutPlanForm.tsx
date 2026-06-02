"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { workoutPlanSchema } from "@/features/pt-training/schemas/pt-training.schemas"
import type { WorkoutPlanFormValues } from "@/features/pt-training/schemas/pt-training.schemas"
import type { WorkoutPlanDraft } from "@/features/pt-training/types/pt-training.types"

type WorkoutPlanFormProps = {
  isPending?: boolean
  onSubmit: (draft: WorkoutPlanDraft) => Promise<void>
}

const defaultExercise = {
  name: "",
  sets: 3,
  reps: "10",
  note: "",
}

export function WorkoutPlanForm({
  isPending,
  onSubmit,
}: WorkoutPlanFormProps) {
  const form = useForm<WorkoutPlanFormValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      title: "",
      exercises: [defaultExercise],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  })

  async function handleSubmit(values: WorkoutPlanFormValues) {
    await onSubmit({
      title: values.title.trim(),
      exercises: values.exercises.map((exercise, index) => ({
        name: exercise.name.trim(),
        sets: exercise.sets,
        reps: exercise.reps.trim(),
        note: exercise.note?.trim() || undefined,
        orderIndex: index,
      })),
    })
    form.reset({ title: "", exercises: [defaultExercise] })
    toast.success("Đã lưu giáo án")
  }

  return (
    <form
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div>
        <label
          className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
          htmlFor="workout-title"
        >
          Tên giáo án
        </label>
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
          id="workout-title"
          placeholder="Tăng cơ nâng cao"
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="mt-2 text-sm font-medium text-destructive">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Bài tập
          </p>
          <Button
            className="min-h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
            onClick={() => append(defaultExercise)}
            type="button"
            variant="outline"
          >
            <Plus aria-hidden="true" className="size-4" />
            Thêm bài tập
          </Button>
        </div>

        {form.formState.errors.exercises?.root ? (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.exercises.root.message}
          </p>
        ) : null}

        {fields.map((field, index) => (
          <div
            className="rounded-2xl border border-border bg-background p-4"
            key={field.id}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-foreground">Bài tập {index + 1}</p>
              <Button
                aria-label={`Xóa bài tập ${index + 1}`}
                className="size-9 rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 active:scale-[0.98]"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                type="button"
                variant="outline"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_96px_120px]">
              <div>
                <label className="sr-only" htmlFor={`exercise-name-${index}`}>
                  Tên bài tập
                </label>
                <input
                  className="min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  id={`exercise-name-${index}`}
                  placeholder="Tên bài tập"
                  {...form.register(`exercises.${index}.name`)}
                />
                {form.formState.errors.exercises?.[index]?.name ? (
                  <p className="mt-2 text-xs font-medium text-destructive">
                    {form.formState.errors.exercises[index]?.name?.message}
                  </p>
                ) : null}
              </div>
              <input
                className="min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                id={`exercise-sets-${index}`}
                min={1}
                type="number"
                {...form.register(`exercises.${index}.sets`, {
                  valueAsNumber: true,
                })}
              />
              <input
                className="min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                id={`exercise-reps-${index}`}
                placeholder="8-10"
                {...form.register(`exercises.${index}.reps`)}
              />
            </div>
            <textarea
              className="mt-3 min-h-20 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
              id={`exercise-note-${index}`}
              placeholder="Cue kỹ thuật, tempo hoặc lưu ý an toàn"
              {...form.register(`exercises.${index}.note`)}
            />
          </div>
        ))}
      </div>

      <Button
        className="mt-5 min-h-12 w-full rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
        data-testid="workout-plan-submit-button"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Đang lưu giáo án..." : "Lưu giáo án"}
      </Button>
    </form>
  )
}
