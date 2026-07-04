"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GENDER_OPTIONS,
  toCanonicalGender,
  type GenderValue,
} from "@/lib/validation/person"

const UNSPECIFIED = "unspecified"

type GenderSelectProps = {
  value?: string | null
  onChange: (value: "" | GenderValue) => void
  id?: string
  testId?: string
  disabled?: boolean
  triggerClassName?: string
}

// Select gioi tinh DUNG CHUNG cho moi form (member/PT/staff/admin/profile):
// mot bo gia tri canonical (male/female/other), mot bo nhan (Nam/Nu/Khac).
export function GenderSelect({
  value,
  onChange,
  id,
  testId,
  disabled,
  triggerClassName,
}: GenderSelectProps) {
  const canonical = toCanonicalGender(value)

  return (
    <Select
      disabled={disabled}
      onValueChange={(next) =>
        onChange(next === UNSPECIFIED ? "" : (next as GenderValue))
      }
      value={canonical === "" ? UNSPECIFIED : canonical}
    >
      <SelectTrigger
        className={
          triggerClassName ??
          "min-h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground focus-visible:border-primary focus-visible:ring-primary/20"
        }
        data-testid={testId}
        id={id}
      >
        <SelectValue placeholder="Chọn giới tính" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border border-white/10 bg-zinc-950 text-white">
        <SelectItem className="focus:bg-white/5 focus:text-white" value={UNSPECIFIED}>
          Chưa cập nhật
        </SelectItem>
        {GENDER_OPTIONS.map((option) => (
          <SelectItem
            className="focus:bg-white/5 focus:text-white"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
