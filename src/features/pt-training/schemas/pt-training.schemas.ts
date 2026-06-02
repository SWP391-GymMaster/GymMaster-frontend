import { z } from "zod"

export const workoutExerciseSchema = z.object({
  name: z.string().trim().min(2, "Exercise name is required."),
  sets: z
    .number()
    .int("Sets must be a whole number.")
    .min(1, "Sets must be at least 1.")
    .max(20, "Sets must be 20 or less."),
  reps: z.string().trim().min(1, "Reps are required."),
  note: z.string().trim().optional(),
})

export const workoutPlanSchema = z.object({
  title: z.string().trim().min(3, "Plan title is required."),
  exercises: z
    .array(workoutExerciseSchema)
    .min(1, "Add at least one exercise."),
})

export const trainerNoteSchema = z.object({
  content: z.string().trim().min(5, "Trainer note is required."),
})

export type WorkoutPlanFormValues = z.infer<typeof workoutPlanSchema>
export type TrainerNoteFormValues = z.infer<typeof trainerNoteSchema>
