import { z } from "zod"

import { vnTodayIso } from "@/lib/date/vn-time"

// ---------------------------------------------------------------------------
// LUAT CHUNG cho thong tin ca nhan cua MOI actor (member/PT/staff/admin).
// Mot nguon su that duy nhat: moi form import tu day, khong tu che lai.
// Gioi han do dai khop dung cot DB (users / member_profiles / trainer_profiles
// / staff_profiles) de khong bao gio no loi truncation o SQL.
// ---------------------------------------------------------------------------

export const PERSON_LIMITS = {
  fullName: 150,
  address: 255,
  emergencyContact: 100,
  specialty: 150,
  bio: 1000,
} as const

export const vnPhonePattern = /^(0|\+84)(\d{9,10})$/

export const GENDER_VALUES = ["male", "female", "other"] as const
export type GenderValue = (typeof GENDER_VALUES)[number]

export const GENDER_OPTIONS: ReadonlyArray<{
  value: GenderValue
  label: string
}> = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
]

const genderLabels: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
  nam: "Nam",
  nu: "Nữ",
  nữ: "Nữ",
  khac: "Khác",
  khác: "Khác",
}

// Nhan tieng Viet de HIEN THI; du lieu cu ("Nam"/"nu"...) van map duoc,
// gia tri la thi tra nguyen van thay vi lam mat thong tin.
export function genderLabel(value?: string | null): string {
  if (!value) return "Chưa cập nhật"
  return genderLabels[value.toLowerCase()] ?? value
}

// Dua gia tri gioi tinh bat ky (ke ca du lieu cu "Nam"/"nu") ve bo canonical;
// khong nhan dang duoc thi tra "" de form khong gui gia tri rac.
export function toCanonicalGender(value?: string | null): "" | GenderValue {
  const normalized = value?.trim().toLowerCase() ?? ""
  if (normalized === "male" || normalized === "nam") return "male"
  if (normalized === "female" || normalized === "nu" || normalized === "nữ") return "female"
  if (normalized === "other" || normalized === "khac" || normalized === "khác") return "other"
  return ""
}

export const MIN_DOB_ISO = "1900-01-01"

export const personFieldSchemas = {
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(PERSON_LIMITS.fullName, `Họ tên tối đa ${PERSON_LIMITS.fullName} ký tự.`),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || vnPhonePattern.test(value), {
      message: "Số điện thoại Việt Nam không hợp lệ.",
    }),
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value >= MIN_DOB_ISO, {
      message: "Ngày sinh không hợp lệ (trước năm 1900).",
    })
    .refine((value) => !value || value <= vnTodayIso(), {
      message: "Ngày sinh không được ở tương lai.",
    }),
  gender: z.enum(["", "male", "female", "other"]).optional(),
  address: z
    .string()
    .trim()
    .max(PERSON_LIMITS.address, `Địa chỉ tối đa ${PERSON_LIMITS.address} ký tự.`)
    .optional(),
  emergencyContact: z
    .string()
    .trim()
    .max(
      PERSON_LIMITS.emergencyContact,
      `Liên hệ khẩn cấp tối đa ${PERSON_LIMITS.emergencyContact} ký tự.`,
    )
    .optional(),
}
