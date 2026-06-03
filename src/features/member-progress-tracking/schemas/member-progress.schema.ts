import { z } from "zod"

export const progressEntrySchema = z.object({
  measuredAt: z.string().min(1, "Vui lòng chọn ngày ghi nhận."),
  weightKg: z.coerce
    .number({
      message: "Cân nặng phải là một số.",
    })
    .positive("Cân nặng phải lớn hơn 0."),
  bodyFatPct: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined
      return Number(val)
    },
    z.number({
      message: "Tỷ lệ mỡ phải là một số.",
    })
      .min(1, "Tỷ lệ mỡ phải lớn hơn hoặc bằng 1%.")
      .max(60, "Tỷ lệ mỡ không hợp lý (tối đa 60%).")
      .optional()
  ),
})

export type ProgressEntryFormInput = z.input<typeof progressEntrySchema>
export type ProgressEntryFormValues = z.output<typeof progressEntrySchema>
