export type WorkoutPlanStatus = "active" | "draft" | "archived"

export type WorkoutExercise = {
  id?: number
  workoutPlanId?: number
  name: string
  sets: number
  reps: string
  note?: string
  orderIndex: number
}

export type WorkoutPlan = {
  id: number
  memberId: number
  trainerId: number
  title: string
  status?: WorkoutPlanStatus
  startDate?: string
  createdAt?: string
  updatedAt?: string
  exercises: WorkoutExercise[]
}

export type TrainerNote = {
  id: number
  memberId: number
  trainerId: number
  content: string
  createdAt: string
}

export type WorkoutPlanDraft = {
  title: string
  exercises: Array<{
    name: string
    sets: number
    reps: string
    note?: string
    orderIndex: number
  }>
}

export type TrainerNoteDraft = {
  content: string
}
