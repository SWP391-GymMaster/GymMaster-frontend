import { z } from "zod"

export const staffSearchSchema = z.object({
  query: z.string().trim().min(2, "Enter at least 2 characters."),
})

export const sellPackageSchema = z.object({
  memberId: z.coerce.number().positive("Select a member."),
  packageId: z.coerce.number().positive("Select a package."),
  startDate: z.string().min(1, "Choose a start date."),
  paymentMethod: z.enum(["cash", "transfer", "card", "other"]),
})

export const manualPaymentSchema = z.object({
  membershipId: z.coerce.number().positive("Missing membership."),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  paymentMethod: z.enum(["cash", "transfer", "card", "other"]),
  paidAt: z.string().min(1, "Choose payment time."),
})

export const checkInSchema = z.object({
  query: z.string().trim().min(2, "Enter a member code, phone, email, or name."),
})

export type StaffSearchInput = z.infer<typeof staffSearchSchema>
export type SellPackageFormInput = z.input<typeof sellPackageSchema>
export type SellPackageInput = z.infer<typeof sellPackageSchema>
export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>
export type CheckInInput = z.infer<typeof checkInSchema>
