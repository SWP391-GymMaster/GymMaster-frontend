import { z } from "zod"

import {
  PERSON_LIMITS,
  personFieldSchemas,
  vnPhonePattern,
} from "@/lib/validation/person"

// Moi luat "con nguoi" (ho ten/SDT/ngay sinh/gioi tinh/dia chi/lien he khan cap)
// lay tu lib/validation/person — khong tu che lai o day.

export const memberSearchSchema = z.object({
  query: z.string().trim().optional(),
})

const emailSchema = z.email("Nhập email hợp lệ.")

// Member bat buoc co SDT (quay le tan tra cuu theo SDT).
const requiredVnPhone = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập số điện thoại.")
  .regex(vnPhonePattern, "Số điện thoại Việt Nam không hợp lệ.")

const passwordSchema = z
  .string()
  .optional()
  .refine((value) => !value || value.length >= 6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  })

const specialtySchema = z
  .string()
  .trim()
  .min(2, "Vui lòng nhập chuyên môn.")
  .max(PERSON_LIMITS.specialty, `Chuyên môn tối đa ${PERSON_LIMITS.specialty} ký tự.`)

const bioSchema = z
  .string()
  .trim()
  .max(PERSON_LIMITS.bio, `Giới thiệu tối đa ${PERSON_LIMITS.bio} ký tự.`)
  .optional()

const yearsOfExperienceSchema = z
  .string()
  .optional()
  .refine((value) => !value || (Number(value) >= 0 && Number(value) <= 80), {
    message: "Số năm kinh nghiệm không hợp lệ.",
  })

export const createMemberSchema = z.object({
  fullName: personFieldSchemas.fullName,
  email: emailSchema,
  phone: requiredVnPhone,
  dateOfBirth: personFieldSchemas.dateOfBirth,
  gender: personFieldSchemas.gender,
  address: personFieldSchemas.address,
  emergencyContact: personFieldSchemas.emergencyContact,
})

// Admin sua ho so ca nhan cua hoi vien (email khong doi — dinh danh tai khoan).
export const updateMemberSchema = z.object({
  fullName: personFieldSchemas.fullName,
  phone: requiredVnPhone,
  dateOfBirth: personFieldSchemas.dateOfBirth,
  gender: personFieldSchemas.gender,
  address: personFieldSchemas.address,
  emergencyContact: personFieldSchemas.emergencyContact,
})

// Man Users chi tao tai khoan van hanh; thong tin ca nhan nhap duoc ngay luc tao
// (giong form tao PT) va ghi vao staff_profiles.
export const createUserSchema = z.object({
  fullName: personFieldSchemas.fullName,
  email: emailSchema,
  phone: personFieldSchemas.phone,
  role: z.enum(["staff", "admin"]),
  password: passwordSchema,
  dateOfBirth: personFieldSchemas.dateOfBirth,
  gender: personFieldSchemas.gender,
  address: personFieldSchemas.address,
  emergencyContact: personFieldSchemas.emergencyContact,
})

export const updateUserSchema = z.object({
  fullName: personFieldSchemas.fullName,
  email: emailSchema,
  phone: personFieldSchemas.phone,
  dateOfBirth: personFieldSchemas.dateOfBirth,
  gender: personFieldSchemas.gender,
  address: personFieldSchemas.address,
  emergencyContact: personFieldSchemas.emergencyContact,
})

// Tao PT = MOT buoc duy nhat (tai khoan + ho so). Duong "lien ket tai khoan co san"
// da bo theo quyet dinh owner 2026-07-04; tai khoan pt demo do seeder tu gan ho so.
export const createTrainerSchema = z.object({
  fullName: personFieldSchemas.fullName,
  email: emailSchema,
  phone: personFieldSchemas.phone,
  password: passwordSchema,
  specialty: specialtySchema,
  gender: personFieldSchemas.gender,
  dateOfBirth: personFieldSchemas.dateOfBirth,
  yearsOfExperience: yearsOfExperienceSchema,
  bio: bioSchema,
  address: personFieldSchemas.address,
  emergencyContact: personFieldSchemas.emergencyContact,
})

export const updateTrainerSchema = z.object({
  specialty: specialtySchema,
  gender: personFieldSchemas.gender,
  dateOfBirth: personFieldSchemas.dateOfBirth,
  yearsOfExperience: yearsOfExperienceSchema,
  bio: bioSchema,
  address: personFieldSchemas.address,
  emergencyContact: personFieldSchemas.emergencyContact,
})

export type CreateMemberFormValues = z.infer<typeof createMemberSchema>
export type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>
export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
export type CreateTrainerFormValues = z.infer<typeof createTrainerSchema>
export type UpdateTrainerFormValues = z.infer<typeof updateTrainerSchema>
