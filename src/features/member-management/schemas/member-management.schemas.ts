import { z } from "zod"

export const memberSearchSchema = z.object({
  query: z.string().trim().optional(),
})

export const createMemberSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  phone: z.string().min(8, "Phone must be at least 8 characters."),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
})

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  phone: z.string().optional(),
  role: z.enum(["staff", "pt", "member"]),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 6, {
      message: "Password must be at least 6 characters.",
    }),
})

export const createTrainerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  specialty: z.string().min(2, "Specialty is required."),
  userId: z.string().optional(),
})

export type CreateMemberFormValues = z.infer<typeof createMemberSchema>
export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type CreateTrainerFormValues = z.infer<typeof createTrainerSchema>
