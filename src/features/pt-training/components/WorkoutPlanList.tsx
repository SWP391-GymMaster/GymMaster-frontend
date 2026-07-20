"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  ClipboardList,
  Copy,
  MoreVertical,
  Trash2,
  Printer,
  Search,
  Pencil,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"

import { useRestTimerStore } from "@/stores/useRestTimerStore"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  getWorkoutAssetForExercise,
  getWorkoutCategoryLabel,
} from "@/features/pt-training/data/workout-assets"
import { exerciseLibrary } from "@/features/pt-training/data/exercise-library"
import type { WorkoutPlan, WorkoutExercise } from "@/features/pt-training/types/pt-training.types"
import { formatVnDate } from "@/lib/date/vn-time"
import { cn } from "@/lib/utils"

type WorkoutPlanListProps = {
  error?: Error | null
  isLoading?: boolean
  mediaMode?: "none" | "member" | "coach"
  plans?: WorkoutPlan[]
  // Coach-mode persistence. Without these, coach edits stay local-only.
  onPersistPlan?: (plan: WorkoutPlan) => Promise<void>
  onDeletePlan?: (planId: number) => Promise<void>
  onDuplicatePlan?: (plan: WorkoutPlan) => Promise<void>
}

function formatDate(value?: string) {
  if (!value) return "Chưa có ngày bắt đầu"

  return formatVnDate(value, { month: "short", day: "numeric", year: "numeric" })
}

export function WorkoutPlanList({
  error,
  isLoading,
  mediaMode = "none",
  plans,
  onPersistPlan,
  onDeletePlan,
  onDuplicatePlan,
}: WorkoutPlanListProps) {
  const [prevPlans, setPrevPlans] = useState<WorkoutPlan[] | undefined>(plans)
  const [localPlans, setLocalPlans] = useState<WorkoutPlan[]>(plans || [])

  if (plans !== prevPlans) {
    setPrevPlans(plans)
    setLocalPlans(plans || [])
  }

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="workout-plan-loading">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            className="gm-panel h-40 animate-pulse"
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

  if (!localPlans?.length) {
    return (
      <StateBlock
        description="Tạo giáo án với ít nhất một bài tập để hội viên có hướng dẫn luyện tập."
        title="Chưa có giáo án"
        tone="empty"
      />
    )
  }

  // Optimistically apply `exercises` to a plan locally, then persist to the
  // backend. On failure the query is invalidated (see hooks) which resets local
  // state back to server truth, so the UI never lies about what was saved.
  const persistExercises = async (
    plan: WorkoutPlan,
    exercises: WorkoutExercise[],
    successMessage: string | null,
  ) => {
    const updatedPlan = { ...plan, exercises }
    setLocalPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? updatedPlan : p)),
    )
    try {
      await onPersistPlan?.(updatedPlan)
      if (successMessage) toast.success(successMessage)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể lưu thay đổi giáo án.",
      )
    }
  }

  return (
    <div className="space-y-5">
      {localPlans.map((plan) =>
        mediaMode === "coach" ? (
          <CoachWorkoutPlanCard
            key={plan.id}
            plan={plan}
            onCopyExercise={(idx) => {
              const exToCopy = plan.exercises[idx]
              if (!exToCopy) return
              const newEx = {
                ...exToCopy,
                id: undefined,
                name: `${exToCopy.name} (Bản sao)`,
              }
              const updatedExercises = [
                ...plan.exercises.slice(0, idx + 1),
                newEx,
                ...plan.exercises.slice(idx + 1),
              ].map((ex, exIdx) => ({
                ...ex,
                orderIndex: exIdx + 1,
              }))
              void persistExercises(
                plan,
                updatedExercises,
                `Đã nhân bản bài tập "${exToCopy.name}"!`,
              )
            }}
            onDeleteExercise={(idx) => {
              const exToDelete = plan.exercises[idx]
              if (plan.exercises.length <= 1) {
                toast.error(
                  "Giáo án phải có ít nhất 1 bài tập. Hãy xóa cả giáo án nếu không cần nữa.",
                )
                return
              }
              const updatedExercises = plan.exercises
                .filter((_, exIdx) => exIdx !== idx)
                .map((ex, exIdx) => ({
                  ...ex,
                  orderIndex: exIdx + 1,
                }))
              void persistExercises(
                plan,
                updatedExercises,
                exToDelete ? `Đã xóa bài tập "${exToDelete.name}"!` : "Đã xóa bài tập!",
              )
            }}
            onUpdateExercise={(idx, field, value) => {
              const updatedExercises = plan.exercises.map((ex, exIdx) => {
                if (exIdx !== idx) return ex
                return {
                  ...ex,
                  [field]: value,
                }
              })
              // Local-only while typing; persisted on blur via onCommitExercises.
              setLocalPlans((prev) =>
                prev.map((p) => (p.id === plan.id ? { ...p, exercises: updatedExercises } : p))
              )
            }}
            onCommitExercises={() => {
              // Silent autosave on blur (no toast) — only persist when changed.
              void persistExercises(plan, plan.exercises, null)
            }}
            onAddExercise={(name, sets, reps, note) => {
              const defaultEx: WorkoutExercise = {
                name,
                sets,
                reps,
                note,
                orderIndex: plan.exercises.length + 1,
              }
              const updatedExercises = [...plan.exercises, defaultEx]
              void persistExercises(
                plan,
                updatedExercises,
                `Đã thêm bài tập "${name}"!`,
              )
            }}
            onReorderExercises={(newExs) => {
              void persistExercises(plan, newExs, "Đã sắp xếp lại bài tập!")
            }}
            onRenamePlan={async (newTitle) => {
              const updatedPlan = { ...plan, title: newTitle }
              setLocalPlans((prev) =>
                prev.map((p) => (p.id === plan.id ? updatedPlan : p))
              )
              try {
                await onPersistPlan?.(updatedPlan)
                toast.success(`Đã cập nhật tên giáo án thành "${newTitle}"!`)
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Không thể đổi tên giáo án.",
                )
              }
            }}
            onCopyPlan={async () => {
              try {
                await onDuplicatePlan?.(plan)
                toast.success(`Đã nhân bản giáo án "${plan.title}"!`)
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Không thể nhân bản giáo án.",
                )
              }
            }}
            onDeletePlan={async () => {
              const snapshot = localPlans
              setLocalPlans((prev) => prev.filter((p) => p.id !== plan.id))
              try {
                await onDeletePlan?.(plan.id)
                toast.success(`Đã xóa giáo án "${plan.title}"!`)
              } catch (err) {
                setLocalPlans(snapshot)
                toast.error(
                  err instanceof Error ? err.message : "Không thể xóa giáo án.",
                )
              }
            }}
          />
        ) : (
          <DefaultWorkoutPlanCard
            key={plan.id}
            mediaMode={mediaMode}
            plan={plan}
          />
        ),
      )}
    </div>
  )
}

function CoachWorkoutPlanCard({
  plan,
  onCopyExercise,
  onDeleteExercise,
  onUpdateExercise,
  onCommitExercises,
  onAddExercise,
  onReorderExercises,
  onRenamePlan,
  onCopyPlan,
  onDeletePlan,
}: {
  plan: WorkoutPlan
  onCopyExercise: (idx: number) => void
  onDeleteExercise: (idx: number) => void
  onUpdateExercise: (idx: number, field: "name" | "sets" | "reps" | "note", value: string | number) => void
  onCommitExercises: () => void
  onAddExercise: (name: string, sets: number, reps: string, note: string) => void
  onReorderExercises: (newExs: WorkoutExercise[]) => void
  onRenamePlan: (newTitle: string) => void
  onCopyPlan: () => void
  onDeletePlan: () => void
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [prevTitle, setPrevTitle] = useState(plan.title)
  const [tempTitle, setTempTitle] = useState(plan.title)

  if (plan.title !== prevTitle) {
    setPrevTitle(plan.title)
    setTempTitle(plan.title)
  }

  const handleSaveTitle = () => {
    const trimmed = tempTitle.trim()
    if (!trimmed) {
      toast.error("Tên giáo án không được để trống!")
      setTempTitle(plan.title)
      setIsEditingTitle(false)
      return
    }
    if (trimmed !== plan.title) {
      onRenamePlan(trimmed)
      toast.success(`Đã cập nhật tên giáo án thành "${trimmed}"!`)
    }
    setIsEditingTitle(false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = plan.exercises.findIndex((ex, idx) => {
      const id = ex.id ? String(ex.id) : `${ex.name}-${idx}`
      return id === active.id
    })
    const newIndex = plan.exercises.findIndex((ex, idx) => {
      const id = ex.id ? String(ex.id) : `${ex.name}-${idx}`
      return id === over.id
    })

    if (oldIndex !== -1 && newIndex !== -1) {
      const newExs = arrayMove(plan.exercises, oldIndex, newIndex).map((ex, idx) => ({
        ...ex,
        orderIndex: idx + 1,
      }))
      onReorderExercises(newExs)
    }
  }

  const exerciseIds = plan.exercises.map((ex, idx) => (ex.id ? String(ex.id) : `${ex.name}-${idx}`))

  return (
    <article className="gm-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            {isEditingTitle ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="max-w-[320px] h-9 text-base font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveTitle()
                  } else if (e.key === "Escape") {
                    setIsEditingTitle(false)
                    setTempTitle(plan.title)
                  }
                }}
                onBlur={handleSaveTitle}
              />
            ) : (
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {plan.title}
              </h3>
            )}
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {plan.exercises.length} bài tập
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(plan.startDate ?? plan.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-10 rounded-xl border-border bg-card text-foreground hover:bg-muted"
                type="button"
                variant="outline"
              >
                <MoreVertical aria-hidden="true" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                <Pencil className="mr-2 size-4" />
                <span>Sửa tên giáo án</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyPlan}>
                <Copy className="mr-2 size-4" />
                <span>Nhân bản giáo án</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={onDeletePlan}
              >
                <Trash2 className="mr-2 size-4" />
                <span>Xóa giáo án</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exerciseIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-border">
            {plan.exercises.map((exercise, index) => (
              <SortableCoachExerciseRow
                key={exercise.id ? String(exercise.id) : `${exercise.name}-${index}`}
                exercise={exercise}
                index={index}
                onCopy={() => onCopyExercise(index)}
                onDelete={() => onDeleteExercise(index)}
                onUpdate={(field, val) => onUpdateExercise(index, field, val)}
                onCommit={onCommitExercises}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/60 p-4">
        <Button
          className="rounded-xl border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 active:scale-[0.98] font-bold"
          type="button"
          variant="outline"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Thêm bài tập
        </Button>
        <div className="flex flex-wrap gap-6 text-sm">
          <SummaryItem label="Tổng cộng" value={`${plan.exercises.length} bài`} />
        </div>
      </div>

      <AddExerciseDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={(name, sets, reps, note) => {
          onAddExercise(name, sets, reps, note)
        }}
      />
    </article>
  )
}

type AddExerciseDialogProps = {
  isOpen: boolean
  onClose: () => void
  onAdd: (exerciseName: string, defaultSets: number, defaultReps: string, defaultNote: string) => void
}

function AddExerciseDialog({ isOpen, onClose, onAdd }: AddExerciseDialogProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("Tất cả")

  const categoryMapping: Record<string, string[]> = {
    "Tất cả": [],
    "Ngực": ["Chest"],
    "Lưng": ["Back"],
    "Vai": ["Shoulders"],
    "Chân": ["Legs", "Glutes"],
    "Core": ["Core"],
  }

  const filteredExercises = useMemo(() => {
    let result = exerciseLibrary

    // Filter by category
    const targetCats = categoryMapping[category] || []
    if (targetCats.length > 0) {
      result = result.filter((e) => targetCats.includes(e.category))
    }

    // Filter by search
    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.muscleGroups.some((m) => m.toLowerCase().includes(query))
      )
    }

    return result
  }, [search, category])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-zinc-950 border border-white/10 text-white rounded-2xl max-h-[85vh] flex flex-col focus:outline-none">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-white">Thư viện bài tập</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Tìm kiếm và thêm bài tập phù hợp vào giáo án của hội viên.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative my-2 shrink-0">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm bài tập (ví dụ: Bench Press, Squat...)"
            className="pl-9 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500 rounded-xl min-h-10 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none">
          {["Tất cả", "Ngực", "Lưng", "Vai", "Chân", "Core"].map((cat) => {
            const active = category === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Exercises Scroll List */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2 divide-y divide-white/5 pr-1 scrollbar-thin">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((ex) => {
              const asset = getWorkoutAssetForExercise(ex.name)
              return (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-zinc-900 border border-white/5">
                    <img
                      alt={ex.name}
                      src={asset.src}
                      className="absolute inset-0 size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-white truncate">{ex.name}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-bold text-primary whitespace-nowrap">
                        {getWorkoutCategoryLabel(asset.category)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {ex.muscleGroups.join(", ")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-xl border-white/10 hover:bg-primary/10 hover:text-primary active:scale-[0.96] text-xs font-bold text-white shrink-0"
                    onClick={() => {
                      onAdd(ex.name, ex.defaultSets, ex.defaultReps, ex.defaultNote)
                      toast.success(`Đã thêm bài tập "${ex.name}"!`)
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-zinc-400">
              Không tìm thấy bài tập nào phù hợp.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SortableCoachExerciseRow({
  exercise,
  index,
  onCopy,
  onDelete,
  onUpdate,
  onCommit,
}: {
  exercise: WorkoutExercise
  index: number
  onCopy: () => void
  onDelete: () => void
  onUpdate: (field: "name" | "sets" | "reps" | "note", value: string | number) => void
  onCommit: () => void
}) {
  const id = exercise.id ? String(exercise.id) : `${exercise.name}-${index}`
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Persist on blur only when an editable field actually changed, so merely
  // tabbing through fields doesn't spam the backend with no-op updates.
  const editSnapshot = useRef<string | null>(null)
  const snapshotKey = () =>
    JSON.stringify({
      name: exercise.name,
      note: exercise.note ?? "",
      sets: exercise.sets,
      reps: exercise.reps,
    })
  const handleFieldFocus = () => {
    editSnapshot.current = snapshotKey()
  }
  const handleFieldBlur = () => {
    if (editSnapshot.current !== null && editSnapshot.current !== snapshotKey()) {
      onCommit()
    }
    editSnapshot.current = null
  }

  const asset = getWorkoutAssetForExercise(exercise.name)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-3 bg-card p-4 xl:flex-row xl:flex-wrap xl:items-center 2xl:flex-nowrap",
        isDragging && "z-50 shadow-lg border border-primary/20 rounded-xl"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="hidden cursor-grab select-none px-2 py-4 text-muted-foreground hover:text-foreground active:cursor-grabbing 2xl:block"
      >
        ::
      </div>

      <div className="flex min-w-[220px] flex-1 items-center gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          <img
            alt={`Minh họa bài tập ${exercise.name}`}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            src={asset.src}
          />
        </div>

        <div className="min-w-0 flex-1">
          <Input
            value={exercise.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
            className="h-8 w-full border-none bg-transparent p-0 font-semibold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
          <span className="mt-1 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {getWorkoutCategoryLabel(asset.category)}
          </span>
          <Input
            value={exercise.note || ""}
            placeholder="Cue kỹ thuật..."
            onChange={(e) => onUpdate("note", e.target.value)}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
            className="mt-1 h-7 w-full border-none bg-transparent p-0 text-sm text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="ml-auto flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
        <div className="grid w-full grid-cols-2 gap-2 sm:w-[172px]">
          <CoachInlineField
            label="Sets"
            value={String(exercise.sets)}
            onChange={(val) => onUpdate("sets", Number(val) || 0)}
            onFocus={handleFieldFocus}
            onCommit={handleFieldBlur}
          />
          <CoachInlineField
            label="Reps"
            value={exercise.reps || ""}
            onChange={(val) => onUpdate("reps", val)}
            onFocus={handleFieldFocus}
            onCommit={handleFieldBlur}
          />
        </div>

        <div className="flex items-center justify-end gap-2 sm:pb-px">
          <Button
            className="size-9 rounded-xl border-border bg-card text-foreground hover:bg-muted active:scale-[0.95]"
            type="button"
            variant="outline"
            onClick={onCopy}
            title="Sao chép"
          >
            <Copy aria-hidden="true" className="size-4" />
          </Button>
          <Button
            className="size-9 rounded-xl border-destructive/20 bg-card text-destructive hover:bg-destructive/10 active:scale-[0.95]"
            type="button"
            variant="outline"
            onClick={onDelete}
            title="Xóa"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function CoachInlineField({
  label,
  value,
  onChange,
  onFocus,
  onCommit,
}: {
  label: string
  value: string | null
  onChange?: (val: string) => void
  onFocus?: () => void
  onCommit?: () => void
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onBlur={onCommit}
        readOnly={!onChange}
      />
    </label>
  )
}

function DefaultWorkoutPlanCard({
  mediaMode,
  plan,
}: {
  mediaMode: "none" | "member"
  plan: WorkoutPlan
}) {
  return (
    <article className="gm-interactive-card overflow-hidden transition-all duration-200">
      <div className="border-b border-border bg-primary/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {formatDate(plan.startDate ?? plan.createdAt)}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {plan.title}
            </h3>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-primary">
            {plan.status ?? "—"}
          </span>
        </div>

        {mediaMode === "member" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PlanStat label="Số bài" value={`${plan.exercises.length}`} />
            <PlanStat
              label="Bài có cue"
              value={`${plan.exercises.filter((e) => e.note?.trim()).length}`}
            />
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "p-5",
          mediaMode === "member" ? "grid gap-4" : "space-y-3",
        )}
      >
        {plan.exercises.map((exercise, index) => (
          <ExerciseRow
            exercise={exercise}
            index={index}
            key={`${plan.id}-${exercise.orderIndex}-${exercise.name}`}
            mediaMode={mediaMode}
          />
        ))}
      </div>
    </article>
  )
}

function ExerciseRow({
  exercise,
  index,
  mediaMode,
}: {
  exercise: WorkoutPlan["exercises"][number]
  index: number
  mediaMode: "none" | "member"
}) {
  const asset = getWorkoutAssetForExercise(exercise.name)
  const startTimer = useRestTimerStore((s) => s.startTimer)

  if (mediaMode === "member") {
    return (
      <div className="grid gap-4 rounded-2xl border border-border bg-background p-3 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="relative min-h-36 overflow-hidden rounded-xl border border-border bg-muted print:hidden">
          <img
            alt={`Minh họa bài tập ${exercise.name}`}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            src={asset.src}
          />
          <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
            {getWorkoutCategoryLabel(asset.category)}
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4 p-1">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground print:bg-zinc-200 print:text-zinc-950">
                  {index + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold text-foreground print-exercise-name">
                    {exercise.name}
                  </p>
                  {exercise.note ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground print-exercise-note">
                      {exercise.note}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-2 grid-cols-3 flex-1 print-exercise-details">
              <ExerciseStat label="Sets" value={`${exercise.sets}`} />
              <ExerciseStat label="Reps" value={exercise.reps} />
              <ExerciseStat label="Cue" value={exercise.note ? "Có" : "Chưa có"} />
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-xl text-xs active:scale-95 transition"
                onClick={() => startTimer(60, exercise.name, "Hội viên")}
              >
                Nghỉ 60s
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-xl text-xs active:scale-95 transition"
                onClick={() => startTimer(90, exercise.name, "Hội viên")}
              >
                Nghỉ 90s
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="gm-panel-muted grid gap-3 p-3 text-sm sm:grid-cols-[1fr_auto_auto]">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index + 1}
        </span>
        <div>
          <p className="font-semibold text-foreground">{exercise.name}</p>
          {exercise.note ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {exercise.note}
            </p>
          ) : null}
        </div>
      </div>
      <p className="font-semibold text-foreground">{exercise.sets} hiệp</p>
      <p className="font-semibold text-foreground">{exercise.reps} reps</p>
    </div>
  )
}

function PlanStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl border border-border bg-card p-3">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="mt-1 block text-sm font-semibold text-foreground">
        {value}
      </span>
    </span>
  )
}

function ExerciseStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl border border-border bg-card px-3 py-2">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="mt-0.5 block text-sm font-semibold text-foreground">
        {value}
      </span>
    </span>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="mt-0.5 block font-semibold text-foreground">{value}</span>
    </span>
  )
}

export function WorkoutPlanListHeader() {
  const [hideNotes, setHideNotes] = useState(false)
  const [hidePT, setHidePT] = useState(false)
  const [largeText, setLargeText] = useState(false)

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const toggleOption = (option: 'notes' | 'pt' | 'text') => {
    if (typeof window === "undefined") return
    const root = document.body
    if (option === 'notes') {
      root.classList.toggle('print-hide-notes')
      setHideNotes(!hideNotes)
    } else if (option === 'pt') {
      root.classList.toggle('print-hide-pt')
      setHidePT(!hidePT)
    } else if (option === 'text') {
      root.classList.toggle('print-large-text')
      setLargeText(!largeText)
    }
  }

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        document.body.classList.remove('print-hide-notes', 'print-hide-pt', 'print-large-text')
      }
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 w-full border-b border-border/50 pb-4 md:flex-row md:items-center md:justify-between print:border-none print:pb-0">
      <div className="flex items-center gap-2">
        <ClipboardList aria-hidden="true" className="size-5 text-primary" />
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Giáo án luyện tập
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-4 print:hidden">
        {/* Print Customizer Checkboxes */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-r border-border/60 pr-4">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition select-none">
            <Checkbox
              checked={hideNotes}
              onCheckedChange={() => toggleOption('notes')}
            />
            Ẩn ghi chú
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition select-none">
            <Checkbox
              checked={hidePT}
              onCheckedChange={() => toggleOption('pt')}
            />
            Ẩn tên PT
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition select-none">
            <Checkbox
              checked={largeText}
              onCheckedChange={() => toggleOption('text')}
            />
            Chữ to (+2px)
          </label>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handlePrint}
          className="rounded-xl flex items-center gap-1.5 bg-card border-border hover:bg-muted text-foreground font-medium h-9 active:scale-95 transition"
        >
          <Printer className="size-4" />
          In giáo án
        </Button>
      </div>
    </div>
  )
}
