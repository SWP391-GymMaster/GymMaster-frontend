"use client"

import { useId, useState, type ChangeEvent } from "react"
import { Upload } from "lucide-react"

import { UserAvatar } from "@/components/data/UserAvatar"
import { useUploadMyAvatar } from "@/features/account/api/account.queries"
import { cn } from "@/lib/utils"

type AccountAvatarUploaderProps = {
  avatarUrl?: string | null
  className?: string
  description?: string
  inputId?: string
  inputTestId?: string
  name: string
  title?: string
  variant?: "stacked" | "inline"
}

const maxAvatarBytes = 5 * 1024 * 1024
const acceptedAvatarTypes = ["image/jpeg", "image/png", "image/webp"]

export function AccountAvatarUploader({
  avatarUrl,
  className,
  description,
  inputId,
  inputTestId = "account-avatar-input",
  name,
  title,
  variant = "stacked",
}: AccountAvatarUploaderProps) {
  const generatedId = useId()
  const fileInputId = inputId ?? `account-avatar-${generatedId}`
  const uploadAvatar = useUploadMyAvatar()
  const [avatarError, setAvatarError] = useState<string | null>(null)

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    setAvatarError(null)

    if (!file) {
      return
    }

    if (!acceptedAvatarTypes.includes(file.type)) {
      setAvatarError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.")
      return
    }

    if (file.size > maxAvatarBytes) {
      setAvatarError("Ảnh đại diện tối đa 5 MB.")
      return
    }

    try {
      await uploadAvatar.mutateAsync(file)
    } catch {
      // Hook da hien toast; giu loi inline cho cac loi validate phia client.
    }
  }

  return (
    <div
      className={cn(
        variant === "inline"
          ? "flex flex-col gap-4 sm:flex-row sm:items-center sm:text-left"
          : "flex flex-col items-center gap-4 text-center",
        className,
      )}
    >
      <UserAvatar
        avatarUrl={avatarUrl}
        className="border-primary/20"
        name={name}
        size="lg"
      />
      <div
        className={cn(
          "grid gap-2",
          variant === "inline" ? "sm:justify-items-start" : "",
        )}
      >
        {title ? (
          <p className="text-sm font-semibold text-foreground">{title}</p>
        ) : null}
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        <label
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-primary/10 active:scale-[0.98]"
          htmlFor={fileInputId}
        >
          <Upload aria-hidden="true" className="size-4" />
          {uploadAvatar.isPending ? "Đang tải..." : "Chọn ảnh"}
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={`${fileInputId}-help`}
          className="sr-only"
          data-testid={inputTestId}
          disabled={uploadAvatar.isPending}
          id={fileInputId}
          onChange={handleAvatarChange}
          type="file"
        />
        <p
          className="text-xs leading-5 text-muted-foreground"
          id={`${fileInputId}-help`}
        >
          JPG, PNG hoặc WebP. Tối đa 5 MB.
        </p>
        {avatarError ? (
          <p className="text-xs font-semibold text-destructive">
            {avatarError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
