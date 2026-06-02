import { z } from "zod"

export const staffSearchSchema = z.object({
  query: z.string().trim().min(2, "Nhập ít nhất 2 ký tự."),
})

export const sellPackageSchema = z.object({
  memberId: z.coerce.number().positive("Chọn hội viên."),
  packageId: z.coerce.number().positive("Chọn gói tập."),
  startDate: z.string().min(1, "Chọn ngày bắt đầu."),
  paymentMethod: z.enum(["cash", "transfer", "card", "other"]),
})

export const manualPaymentSchema = z.object({
  membershipId: z.coerce.number().positive("Thiếu gói hội viên."),
  amount: z.coerce.number().positive("Số tiền phải lớn hơn 0."),
  paymentMethod: z.enum(["cash", "transfer", "card", "other"]),
  paidAt: z.string().min(1, "Chọn thời điểm thanh toán."),
})

export const checkInSchema = z.object({
  query: z.string().trim().min(2, "Nhập mã hội viên, điện thoại, email hoặc tên."),
})

export type StaffSearchInput = z.infer<typeof staffSearchSchema>
export type SellPackageFormInput = z.input<typeof sellPackageSchema>
export type SellPackageInput = z.infer<typeof sellPackageSchema>
export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>
export type CheckInInput = z.infer<typeof checkInSchema>
