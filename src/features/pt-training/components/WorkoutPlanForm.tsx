"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useMemo, useState, useEffect, type ReactNode } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"

const LOCAL_STORAGE_KEY_RECENT_EXERCISES = "gymmaster-recent-exercises"

function getRecentExercises(): string[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_RECENT_EXERCISES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecentExercises(names: string[]) {
  if (typeof window === "undefined") return
  try {
    const current = getRecentExercises()
    const merged = Array.from(new Set([...names, ...current])).slice(0, 5)
    localStorage.setItem(LOCAL_STORAGE_KEY_RECENT_EXERCISES, JSON.stringify(merged))
  } catch (e) {
    console.warn(e)
  }
}

import { Button } from "@/components/ui/button"
import {
  exerciseLibrary,
  getExerciseById,
  getExerciseIdByName,
  getFilteredExercises,
  getFilteredPresets,
  trainingDaysPerWeekOptions,
  trainingEnvironmentOptions,
  trainingGoalOptions,
  trainingSplitOptions,
  workoutPresets,
  type TrainingEnvironment,
  type TrainingGoal,
  type TrainingSplit,
  type WorkoutPreset,
} from "@/features/pt-training/data/exercise-library"
import { workoutPlanSchema } from "@/features/pt-training/schemas/pt-training.schemas"
import type { WorkoutPlanFormValues } from "@/features/pt-training/schemas/pt-training.schemas"
import type { WorkoutPlanDraft } from "@/features/pt-training/types/pt-training.types"
import { cn } from "@/lib/utils"

type WorkoutPlanFormProps = {
  isPending?: boolean
  onSubmit: (draft: WorkoutPlanDraft) => Promise<void>
  externalExerciseToAdd?: string
  onExternalExerciseAdded?: () => void
}

const defaultExercise = {
  name: "",
  sets: 3,
  reps: "10",
  note: "",
}

const steps = [
  {
    title: "Bối cảnh",
    description: "Mục tiêu & môi trường",
  },
  {
    title: "Preset",
    description: "Cấu trúc giáo án",
  },
  {
    title: "Bài tập",
    description: "Tùy chỉnh chi tiết",
  },
  {
    title: "Lưu",
    description: "Kiểm tra lần cuối",
  },
] as const

export function WorkoutPlanForm({
  isPending,
  onSubmit,
  externalExerciseToAdd,
  onExternalExerciseAdded,
}: WorkoutPlanFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [environment, setEnvironment] = useState<TrainingEnvironment>("gym")
  const [goal, setGoal] = useState<TrainingGoal>("hypertrophy")
  const [split, setSplit] = useState<TrainingSplit>("full_body")
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3)
  const [presetId, setPresetId] = useState("")
  const [recentExercises, setRecentExercises] = useState<string[]>([])

  useEffect(() => {
    setRecentExercises(getRecentExercises())
  }, [activeStep])

  const form = useForm<WorkoutPlanFormValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      title: "",
      exercises: [defaultExercise],
    },
  })

  const { fields, append, replace, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  })

  useEffect(() => {
    if (externalExerciseToAdd) {
      const exercise = exerciseLibrary.find((e) => e.name === externalExerciseToAdd)
      if (exercise) {
        const currentExercises = form.getValues("exercises")
        if (currentExercises.length === 1 && currentExercises[0].name === "") {
          form.setValue("exercises.0.name", exercise.name, { shouldValidate: true })
          form.setValue("exercises.0.sets", exercise.defaultSets, { shouldValidate: true })
          form.setValue("exercises.0.reps", exercise.defaultReps, { shouldValidate: true })
          form.setValue("exercises.0.note", exercise.defaultNote, { shouldValidate: true })
        } else {
          append({
            name: exercise.name,
            sets: exercise.defaultSets,
            reps: exercise.defaultReps,
            note: exercise.defaultNote || "",
          })
        }
        toast.success(`Đã thêm bài tập: ${exercise.name}`)
        setActiveStep(2) // Switch to step 3 (index 2: "Bài tập")
      }
      onExternalExerciseAdded?.()
    }
  }, [externalExerciseToAdd, onExternalExerciseAdded, append, form])

  const currentTitle = form.watch("title")
  const currentExercises = form.watch("exercises")

  const filteredExercises = useMemo(
    () => getFilteredExercises({ environment, goal }),
    [environment, goal],
  )

  const filteredPresets = useMemo(
    () =>
      getFilteredPresets({
        daysPerWeek,
        environment,
        goal,
        split,
      }),
    [daysPerWeek, environment, goal, split],
  )

  const recommendedPresets = useMemo(() => {
    if (filteredPresets.length > 0) {
      return {
        items: filteredPresets,
        mode: "exact" as const,
        message: "Preset khớp chính xác với bộ lọc hiện tại.",
      }
    }

    const sameSplitAndDays = workoutPresets.filter(
      (preset) => preset.split === split && preset.daysPerWeek === daysPerWeek,
    )

    if (sameSplitAndDays.length > 0) {
      return {
        items: sameSplitAndDays,
        mode: "near" as const,
        message:
          "Chưa có preset khớp 100%. Đang gợi ý preset cùng split và số buổi/tuần.",
      }
    }

    const sameSplit = workoutPresets.filter((preset) => preset.split === split)

    if (sameSplit.length > 0) {
      return {
        items: sameSplit,
        mode: "near" as const,
        message:
          "Chưa có preset khớp 100%. Đang gợi ý preset cùng kiểu split.",
      }
    }

    return {
      items: workoutPresets,
      mode: "fallback" as const,
      message:
        "Chưa có preset khớp bộ lọc. Đang hiển thị toàn bộ preset có sẵn.",
    }
  }, [daysPerWeek, filteredPresets, split])

  const selectedPreset =
    recommendedPresets.items.find((preset) => preset.id === presetId) ?? null

  const selectExerciseOptions =
    filteredExercises.length > 0 ? filteredExercises : exerciseLibrary

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

    // Cache exercise names
    const namesToSave = values.exercises.map((e) => e.name.trim()).filter(Boolean)
    if (namesToSave.length > 0) {
      saveRecentExercises(namesToSave)
      setRecentExercises(getRecentExercises())
    }

    form.reset({ title: "", exercises: [defaultExercise] })
    setPresetId("")
    setActiveStep(0)
    toast.success("Đã lưu giáo án")
  }

  async function handleNext() {
    if (activeStep === 1) {
      const validTitle = await form.trigger("title")

      if (!validTitle) return
    }

    if (activeStep === 2) {
      const validExercises = await form.trigger("exercises")

      if (!validExercises) return
    }

    setActiveStep((step) => Math.min(step + 1, steps.length - 1))
  }

  function handleBack() {
    setActiveStep((step) => Math.max(step - 1, 0))
  }

  function applyExercise(index: number, exerciseId: string) {
    if (exerciseId === "__custom__") {
      form.setValue(`exercises.${index}.name`, "", { shouldValidate: true })
      form.setValue(`exercises.${index}.note`, "", { shouldValidate: true })
      return
    }

    const exercise = getExerciseById(exerciseId)
    if (!exercise) return

    form.setValue(`exercises.${index}.name`, exercise.name, {
      shouldValidate: true,
    })
    form.setValue(`exercises.${index}.sets`, exercise.defaultSets, {
      shouldValidate: true,
    })
    form.setValue(`exercises.${index}.reps`, exercise.defaultReps, {
      shouldValidate: true,
    })
    form.setValue(`exercises.${index}.note`, exercise.defaultNote, {
      shouldValidate: true,
    })
  }

  function applyPreset(preset: WorkoutPreset) {
    form.setValue("title", preset.name, { shouldValidate: true })
    replace(
      preset.exercises.map((item) => {
        const exercise = getExerciseById(item.exerciseId)

        return {
          name: exercise?.name ?? "",
          sets: item.sets ?? exercise?.defaultSets ?? 3,
          reps: item.reps ?? exercise?.defaultReps ?? "10",
          note: item.note ?? exercise?.defaultNote ?? "",
        }
      }),
    )
    setPresetId(preset.id)
    toast.success(`Đã áp dụng preset: ${preset.name}`)
  }

  function onPresetSelect(value: string) {
    setPresetId(value)
    const preset = recommendedPresets.items.find((item) => item.id === value)
    if (preset) applyPreset(preset)
  }

  return (
    <form
      className="rounded-2xl border border-border bg-card shadow-sm"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="border-b border-border p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Trình tạo giáo án nhanh
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Tạo giáo án theo từng bước để form gọn hơn: chọn bối cảnh, áp dụng preset, chỉnh bài tập rồi lưu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <SummaryPill label={`${filteredExercises.length || exerciseLibrary.length} bài tập`} />
            <SummaryPill label={`${recommendedPresets.items.length} preset gợi ý`} />
            <SummaryPill
              label={`${daysPerWeek} buổi/tuần`}
              tone="muted"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {steps.map((step, index) => {
            const isDone = index < activeStep
            const isActive = index === activeStep

            return (
              <button
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.98]",
                  isActive
                    ? "border-primary bg-primary/10 shadow-sm"
                    : isDone
                      ? "border-primary/25 bg-primary/5"
                      : "border-border bg-background hover:bg-muted/40",
                )}
                key={step.title}
                onClick={() => setActiveStep(index)}
                type="button"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-card text-primary"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isDone ? <Check aria-hidden="true" className="size-4" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {step.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-5">
        {activeStep === 0 ? (
          <TrainingContextStep
            environment={environment}
            filteredExercisesCount={filteredExercises.length || exerciseLibrary.length}
            goal={goal}
            onEnvironmentChange={(value) => {
              setEnvironment(value)
              setPresetId("")
            }}
            onGoalChange={(value) => {
              setGoal(value)
              setPresetId("")
            }}
          />
        ) : null}

        {activeStep === 1 ? (
          <PresetStep
            daysPerWeek={daysPerWeek}
            onDaysPerWeekChange={(value) => {
              setDaysPerWeek(value)
              setPresetId("")
            }}
            onPresetSelect={onPresetSelect}
            onQuickApply={() => {
              const preset = recommendedPresets.items[0]
              if (preset) applyPreset(preset)
            }}
            onSplitChange={(value) => {
              setSplit(value)
              setPresetId("")
            }}
            presetId={presetId}
            recommendedPresets={recommendedPresets}
            selectedPreset={selectedPreset}
            split={split}
          />
        ) : null}

        {activeStep === 2 ? (
          <ExerciseEditorStep
            append={() => append(defaultExercise)}
            applyExercise={applyExercise}
            errors={form.formState.errors}
            fields={fields}
            form={form}
            remove={remove}
            selectExerciseOptions={selectExerciseOptions}
            recentExercises={recentExercises}
          />
        ) : null}

        {activeStep === 3 ? (
          <ReviewStep
            daysPerWeek={daysPerWeek}
            environment={environment}
            exercises={currentExercises}
            goal={goal}
            split={split}
            title={currentTitle}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
          disabled={activeStep === 0}
          onClick={handleBack}
          type="button"
          variant="outline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Quay lại
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row">
          {activeStep < steps.length - 1 ? (
            <Button
              className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
              onClick={handleNext}
              type="button"
            >
              Tiếp tục
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          ) : (
            <Button
              className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]"
              data-testid="workout-plan-submit-button"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Đang lưu giáo án..." : "Lưu giáo án"}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

function TrainingContextStep({
  environment,
  filteredExercisesCount,
  goal,
  onEnvironmentChange,
  onGoalChange,
}: {
  environment: TrainingEnvironment
  filteredExercisesCount: number
  goal: TrainingGoal
  onEnvironmentChange: (value: TrainingEnvironment) => void
  onGoalChange: (value: TrainingGoal) => void
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <StepHeading
          description="Chọn nơi học viên sẽ tập và mục tiêu chính của giáo án. Thư viện bài tập sẽ tự lọc theo lựa chọn này."
          eyebrow="Bước 1"
          title="Bối cảnh tập luyện"
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {trainingEnvironmentOptions.map((option) => (
            <SelectableCard
              checked={environment === option.value}
              description={option.description}
              key={option.value}
              onClick={() => onEnvironmentChange(option.value)}
              title={option.label}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {trainingGoalOptions.map((option) => (
            <button
              className={cn(
                "min-h-11 rounded-xl border px-3 text-sm font-semibold transition active:scale-[0.98]",
                goal === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted/40",
              )}
              key={option.value}
              onClick={() => onGoalChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">Kết quả lọc</p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-primary">
          {filteredExercisesCount}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          bài tập khả dụng cho bối cảnh hiện tại.
        </p>
      </aside>
    </section>
  )
}

function PresetStep({
  daysPerWeek,
  onDaysPerWeekChange,
  onPresetSelect,
  onQuickApply,
  onSplitChange,
  presetId,
  recommendedPresets,
  selectedPreset,
  split,
}: {
  daysPerWeek: number
  onDaysPerWeekChange: (value: number) => void
  onPresetSelect: (value: string) => void
  onQuickApply: () => void
  onSplitChange: (value: TrainingSplit) => void
  presetId: string
  recommendedPresets: {
    items: WorkoutPreset[]
    mode: "exact" | "near" | "fallback"
    message: string
  }
  selectedPreset: WorkoutPreset | null
  split: TrainingSplit
}) {
  return (
    <section>
      <StepHeading
        description="Chọn kiểu split và số buổi tập mỗi tuần. Nếu không có preset khớp 100%, hệ thống vẫn gợi ý preset gần nhất."
        eyebrow="Bước 2"
        title="Chọn preset giáo án"
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            {trainingSplitOptions.map((option) => (
              <SelectableCard
                checked={split === option.value}
                description={getSplitDescription(option.value)}
                key={option.value}
                onClick={() => {
                  onSplitChange(option.value)
                }}
                title={option.label}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">
              Số buổi tập mỗi tuần
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trainingDaysPerWeekOptions.map((option) => (
                <button
                  className={cn(
                    "min-h-10 rounded-xl border px-4 text-sm font-semibold transition active:scale-[0.98]",
                    daysPerWeek === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                  key={option}
                  onClick={() => onDaysPerWeekChange(option)}
                  type="button"
                >
                  {option} buổi
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-4",
              recommendedPresets.mode === "exact"
                ? "border-primary/20 bg-primary/5"
                : "border-orange-200 bg-orange-50",
            )}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Preset gợi ý
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs leading-5",
                    recommendedPresets.mode === "exact"
                      ? "text-muted-foreground"
                      : "text-orange-800",
                  )}
                >
                  {recommendedPresets.message}
                </p>
              </div>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                  recommendedPresets.mode === "exact"
                    ? "bg-primary/10 text-primary"
                    : "bg-orange-100 text-orange-700",
                )}
              >
                {recommendedPresets.items.length} preset
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              <FilterSelect
                label="Chọn preset"
                onChange={onPresetSelect}
                value={presetId}
              >
                <option value="">Chọn preset để tự điền giáo án</option>
                {recommendedPresets.items.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </FilterSelect>

              <Button
                className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
                disabled={!recommendedPresets.items.length}
                onClick={onQuickApply}
                type="button"
                variant="outline"
              >
                <Dumbbell aria-hidden="true" className="size-4" />
                Áp dụng gợi ý đầu tiên
              </Button>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Preset đang chọn</p>
          {selectedPreset ? (
            <div className="mt-4">
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {selectedPreset.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedPreset.description}
              </p>
              <div className="mt-4 grid gap-2">
                <ReviewRow label="Split" value={formatSplit(selectedPreset.split)} />
                <ReviewRow label="Buổi/tuần" value={`${selectedPreset.daysPerWeek}`} />
                <ReviewRow label="Số bài tập" value={`${selectedPreset.exercises.length}`} />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Chọn preset hoặc dùng gợi ý đầu tiên để tự điền danh sách bài tập.
            </p>
          )}
        </aside>
      </div>
    </section>
  )
}

function ExerciseEditorStep({
  append,
  applyExercise,
  errors,
  fields,
  form,
  remove,
  selectExerciseOptions,
  recentExercises,
}: {
  append: () => void
  applyExercise: (index: number, exerciseId: string) => void
  errors: ReturnType<typeof useForm<WorkoutPlanFormValues>>["formState"]["errors"]
  fields: ReturnType<typeof useFieldArray<WorkoutPlanFormValues, "exercises">>["fields"]
  form: ReturnType<typeof useForm<WorkoutPlanFormValues>>
  remove: (index: number) => void
  selectExerciseOptions: typeof exerciseLibrary
  recentExercises: string[]
}) {
  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <StepHeading
          description="Đặt tên giáo án, chọn bài trong library và chỉnh lại sets, reps hoặc cue nếu cần."
          eyebrow="Bước 3"
          title="Bài tập & tùy chỉnh"
        />
        <Button
          className="min-h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]"
          onClick={append}
          type="button"
          variant="outline"
        >
          <Plus aria-hidden="true" className="size-4" />
          Thêm bài tập
        </Button>
      </div>

      <div className="mt-5">
        <label
          className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
          htmlFor="workout-title"
        >
          Tên giáo án
        </label>
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
          id="workout-title"
          placeholder="Ví dụ: PPL Push Day - Strength"
          {...form.register("title")}
        />
        {errors.title ? (
          <p className="mt-2 text-sm font-medium text-destructive">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      {errors.exercises?.root ? (
        <p className="mt-3 text-sm font-medium text-destructive">
          {errors.exercises.root.message}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {fields.map((field, index) => {
          const currentName = form.watch(`exercises.${index}.name`)
          const selectedExerciseId = getExerciseIdByName(currentName) ?? "__custom__"
          const selectedExercise = getExerciseById(selectedExerciseId)

          return (
            <div
              className="rounded-2xl border border-border bg-background p-4"
              key={field.id}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">Bài tập {index + 1}</p>
                  {selectedExercise ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedExercise.category} · {selectedExercise.level} · {selectedExercise.equipment.join(", ")}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Custom exercise
                    </p>
                  )}
                </div>

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

              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_96px_130px]">
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                    htmlFor={`exercise-select-${index}`}
                  >
                    Chọn bài tập
                  </label>
                  <select
                    className="mt-2 min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    id={`exercise-select-${index}`}
                    onChange={(event) => applyExercise(index, event.target.value)}
                    value={selectedExerciseId}
                  >
                    <option value="__custom__">Custom / nhập tay</option>
                    {groupExercisesByCategory(selectExerciseOptions).map((group) => (
                      <optgroup key={group.category} label={group.category}>
                        {group.items.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  {selectedExerciseId === "__custom__" ? (
                    <>
                      <input
                        className="mt-2 min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        id={`exercise-name-${index}`}
                        placeholder="Tên bài tập custom"
                        {...form.register(`exercises.${index}.name`)}
                      />
                      {recentExercises.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {recentExercises.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                form.setValue(`exercises.${index}.name`, name, { shouldValidate: true })
                              }}
                              className={cn(
                                "px-2.5 py-0.5 text-xs rounded-full border transition active:scale-95",
                                currentName === name
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-card hover:bg-muted text-muted-foreground"
                              )}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : null}

                  {errors.exercises?.[index]?.name ? (
                    <p className="mt-2 text-xs font-medium text-destructive">
                      {errors.exercises[index]?.name?.message}
                    </p>
                  ) : null}
                </div>

                <FieldShell label="Sets">
                  <input
                    className="min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    id={`exercise-sets-${index}`}
                    min={1}
                    type="number"
                    {...form.register(`exercises.${index}.sets`, {
                      valueAsNumber: true,
                    })}
                  />
                </FieldShell>

                <FieldShell label="Reps / Time">
                  <input
                    className="min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    id={`exercise-reps-${index}`}
                    placeholder="8-10"
                    {...form.register(`exercises.${index}.reps`)}
                  />
                </FieldShell>
              </div>

              <label
                className="mt-3 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                htmlFor={`exercise-note-${index}`}
              >
                Cue / note
              </label>
              <textarea
                className="mt-2 min-h-20 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                id={`exercise-note-${index}`}
                placeholder="Cue kỹ thuật, tempo hoặc lưu ý an toàn"
                {...form.register(`exercises.${index}.note`)}
              />

              {selectedExercise ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <ExerciseBadge label={selectedExercise.category} />
                  <ExerciseBadge label={selectedExercise.level} />
                  {selectedExercise.muscleGroups.slice(0, 3).map((group) => (
                    <ExerciseBadge key={group} label={group} />
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ReviewStep({
  daysPerWeek,
  environment,
  exercises,
  goal,
  split,
  title,
}: {
  daysPerWeek: number
  environment: TrainingEnvironment
  exercises: WorkoutPlanFormValues["exercises"]
  goal: TrainingGoal
  split: TrainingSplit
  title: string
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <StepHeading
          description="Kiểm tra lại tên giáo án, số bài tập và cue trước khi lưu."
          eyebrow="Bước 4"
          title="Xem trước & lưu"
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background">
          <div className="border-b border-border bg-primary/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Workout Preview
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {title || "Chưa đặt tên giáo án"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {exercises.length} bài tập · {daysPerWeek} buổi/tuần · {formatSplit(split)}
            </p>
          </div>

          <div className="divide-y divide-border">
            {exercises.map((exercise, index) => (
              <div
                className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]"
                key={`${exercise.name}-${index}`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {exercise.name || "Chưa chọn bài tập"}
                    </p>
                    {exercise.note ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {exercise.note}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {exercise.sets} hiệp
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {exercise.reps} reps
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">Tóm tắt giáo án</p>
        <div className="mt-4 grid gap-3">
          <ReviewRow label="Môi trường" value={formatEnvironment(environment)} />
          <ReviewRow label="Mục tiêu" value={formatGoal(goal)} />
          <ReviewRow label="Split" value={formatSplit(split)} />
          <ReviewRow label="Số buổi/tuần" value={`${daysPerWeek}`} />
          <ReviewRow label="Số bài tập" value={`${exercises.length}`} />
        </div>
      </aside>
    </section>
  )
}

function StepHeading({
  description,
  eyebrow,
  title,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function SelectableCard({
  checked,
  description,
  onClick,
  title,
}: {
  checked: boolean
  description: string
  onClick: () => void
  title: string
}) {
  return (
    <button
      className={cn(
        "flex min-h-28 items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
        checked
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-background",
      )}
      onClick={onClick}
      type="button"
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground",
        )}
      >
        {checked ? <Check aria-hidden="true" className="size-4" /> : null}
      </span>
      <span>
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  )
}

function FilterSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <select
        className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  )
}

function FieldShell({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function SummaryPill({
  label,
  tone = "primary",
}: {
  label: string
  tone?: "primary" | "muted"
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        tone === "primary"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  )
}

function ExerciseBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {label}
    </span>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  )
}

function groupExercisesByCategory(items: typeof exerciseLibrary) {
  const groups = items.reduce<Record<string, typeof exerciseLibrary>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? []
    acc[item.category].push(item)
    return acc
  }, {})

  return Object.entries(groups).map(([category, groupItems]) => ({
    category,
    items: groupItems,
  }))
}

function getSplitDescription(split: TrainingSplit) {
  switch (split) {
    case "full_body":
      return "Toàn thân trong mỗi buổi, phù hợp người mới hoặc lịch ít buổi."
    case "upper_lower":
      return "Tách thân trên/thân dưới, dễ tăng volume theo tuần."
    case "ppl":
      return "Push, Pull, Legs cho học viên muốn tập đều các nhóm cơ."
    case "arnold":
      return "Chest/Back, Shoulders/Arms, Legs theo phong cách Arnold Split."
  }
}

function formatSplit(split: TrainingSplit) {
  return trainingSplitOptions.find((option) => option.value === split)?.label ?? split
}

function formatEnvironment(environment: TrainingEnvironment) {
  return (
    trainingEnvironmentOptions.find((option) => option.value === environment)
      ?.label ?? environment
  )
}

function formatGoal(goal: TrainingGoal) {
  return trainingGoalOptions.find((option) => option.value === goal)?.label ?? goal
}
