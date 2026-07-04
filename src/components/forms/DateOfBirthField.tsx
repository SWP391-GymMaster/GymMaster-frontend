"use client"

import { forwardRef, type ComponentPropsWithoutRef } from "react"

import { Input } from "@/components/ui/input"
import { MIN_DOB_ISO } from "@/lib/validation/person"
import { vnTodayIso } from "@/lib/date/vn-time"

type DateOfBirthFieldProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "type" | "min" | "max"
>

// O nhap ngay sinh DUNG CHUNG: date picker, chan tuong lai + truoc 1900 ngay tu UI.
export const DateOfBirthField = forwardRef<HTMLInputElement, DateOfBirthFieldProps>(
  function DateOfBirthField(props, ref) {
    return (
      <Input
        {...props}
        max={vnTodayIso()}
        min={MIN_DOB_ISO}
        ref={ref}
        type="date"
      />
    )
  },
)
