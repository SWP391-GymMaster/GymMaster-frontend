"use client"

import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type UserAvatarSize = "sm" | "md" | "lg" | "xl"

type UserAvatarProps = React.ComponentProps<typeof Avatar> & {
  name: string
  avatarUrl?: string | null
  size?: UserAvatarSize
}

const sizeClassNames: Record<UserAvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
  xl: "size-28 text-3xl md:size-36 md:text-4xl",
}

export function UserAvatar({
  avatarUrl,
  className,
  name,
  size = "md",
  ...props
}: UserAvatarProps) {
  const displayName = name.trim() || "GymMaster"
  const initials = getInitials(displayName)

  return (
    <Avatar
      aria-label={`Ảnh đại diện của ${displayName}`}
      className={cn(
        sizeClassNames[size],
        "border border-border bg-primary/10 font-bold text-primary shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    >
      {avatarUrl ? (
        <AvatarImage
          alt={`Ảnh đại diện của ${displayName}`}
          src={avatarUrl}
        />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return initials || "GM"
}
