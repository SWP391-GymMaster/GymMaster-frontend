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
    toast.success("Workout plan saved")
  }

  return (
    <form
      className="rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div>
        <label
          className="text-xs font-bold uppercase tracking-[0.08em] text-[#595e6d]"
          htmlFor="workout-title"
        >
          Plan title
        </label>
        <input
          className="mt-2 min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-[#f9f9ff] px-3 text-sm font-semibold text-[#191b23] outline-none transition-all focus:border-[#0058be] focus:ring-2 focus:ring-[#adc6ff]"
          id="workout-title"
          placeholder="Advanced hypertrophy"
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#595e6d]">
            Exercises
          </p>
          <Button
            className="min-h-10 rounded-lg border-[#c2c6d6] bg-white text-[#191b23] hover:bg-[#f2f3fd] active:scale-[0.98]"
            onClick={() => append(defaultExercise)}
            type="button"
            variant="outline"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add exercise
          </Button>
        </div>

        {form.formState.errors.exercises?.root ? (
          <p className="text-sm font-medium text-red-700">
            {form.formState.errors.exercises.root.message}
          </p>
        ) : null}

        {fields.map((field, index) => (
          <div
            className="rounded-lg border border-[#e1e2ec] bg-[#f9f9ff] p-4"
            key={field.id}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-[#191b23]">Exercise {index + 1}</p>
              <Button
                aria-label={`Remove exercise ${index + 1}`}
                className="size-9 rounded-lg border-red-200 text-red-700 hover:bg-red-50 active:scale-[0.98]"
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
                  Exercise name
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-white px-3 text-sm text-[#191b23] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#adc6ff]"
                  id={`exercise-name-${index}`}
                  placeholder="Exercise name"
                  {...form.register(`exercises.${index}.name`)}
                />
                {form.formState.errors.exercises?.[index]?.name ? (
                  <p className="mt-2 text-xs font-medium text-red-700">
                    {form.formState.errors.exercises[index]?.name?.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="sr-only" htmlFor={`exercise-sets-${index}`}>
                  Sets
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-white px-3 text-sm text-[#191b23] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#adc6ff]"
                  id={`exercise-sets-${index}`}
                  min={1}
                  type="number"
                  {...form.register(`exercises.${index}.sets`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div>
                <label className="sr-only" htmlFor={`exercise-reps-${index}`}>
                  Reps
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-[#c2c6d6] bg-white px-3 text-sm text-[#191b23] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#adc6ff]"
                  id={`exercise-reps-${index}`}
                  placeholder="8-10"
                  {...form.register(`exercises.${index}.reps`)}
                />
              </div>
            </div>
            <label className="sr-only" htmlFor={`exercise-note-${index}`}>
              Exercise note
            </label>
            <textarea
              className="mt-3 min-h-20 w-full rounded-lg border border-[#c2c6d6] bg-white px-3 py-2 text-sm text-[#191b23] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#adc6ff]"
              id={`exercise-note-${index}`}
              placeholder="Coach cue, tempo, or safety note"
              {...form.register(`exercises.${index}.note`)}
            />
          </div>
        ))}
      </div>

      <Button
        className="mt-5 min-h-12 w-full rounded-lg bg-[#0058be] text-white hover:bg-[#2170e4] active:scale-[0.98]"
        data-testid="workout-plan-submit-button"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Saving plan..." : "Save workout plan"}
      </Button>
    </form>
  )
}
