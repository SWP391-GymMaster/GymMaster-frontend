import { z } from "zod"

export const workoutExerciseSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập tên bài tập."),
  sets: z
    .number()
    .int("Số hiệp phải là số nguyên.")
    .min(1, "Số hiệp tối thiểu là 1.")
    .max(20, "Số hiệp tối đa là 20."),
  reps: z.string().trim().min(1, "Vui lòng nhập số reps."),
  note: z.string().trim().optional(),
})

export const workoutPlanSchema = z.object({
  title: z.string().trim().min(3, "Vui lòng nhập tên giáo án."),
  exercises: z
    .array(workoutExerciseSchema)
    .min(1, "Thêm ít nhất một bài tập."),
})

export const trainerNoteSchema = z.object({
  content: z.string().trim().min(5, "Vui lòng nhập ghi chú luyện tập."),
})

export type WorkoutPlanFormValues = z.infer<typeof workoutPlanSchema>
export type TrainerNoteFormValues = z.infer<typeof trainerNoteSchema>
