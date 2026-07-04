"use client"

import { forwardRef, type ComponentPropsWithoutRef } from "react"

import { Input } from "@/components/ui/input"

type PhoneFieldProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "type" | "inputMode"
>

// O nhap SDT DUNG CHUNG: bo phim so tren mobile + goi y dinh dang VN thong nhat.
export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(
  function PhoneField(props, ref) {
    return (
      <Input
        placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx"
        {...props}
        inputMode="tel"
        ref={ref}
        type="tel"
      />
    )
  },
)
