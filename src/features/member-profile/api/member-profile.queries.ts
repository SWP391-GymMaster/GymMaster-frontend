"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  getMyProfile,
  updateMyProfile,
} from "@/features/member-profile/api/member-profile.api"
import type {
  MyProfile,
  UpdateMyProfileInput,
} from "@/features/member-profile/types/member-profile.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { ApiClientError } from "@/lib/api/http-client"

export const memberProfileKeys = {
  all: ["member-profile"] as const,
  me: () => [...memberProfileKeys.all, "me"] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

function syncMemberProfileId(profile: MyProfile) {
  const { session, setSession } = useAuthSessionStore.getState()

  if (
    session?.role === "member" &&
    session.user.memberProfileId == null &&
    profile.id
  ) {
    setSession({
      ...session,
      user: {
        ...session.user,
        memberProfileId: profile.id,
      },
    })
  }
}

export function useMyProfile(options?: { enabled?: boolean }) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: memberProfileKeys.me(),
    queryFn: async () => {
      const profile = await getMyProfile(accessToken ?? "")
      syncMemberProfileId(profile)
      return profile
    },
    enabled: Boolean(accessToken) && (options?.enabled ?? true),
  })
}

export function useUpdateMyProfile() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMyProfileInput) =>
      updateMyProfile(accessToken ?? "", input),
    onSuccess: async (profile) => {
      queryClient.setQueryData(memberProfileKeys.me(), profile)
      await queryClient.invalidateQueries({ queryKey: memberProfileKeys.me() })
      toast.success("Đã cập nhật hồ sơ.")
    },
    onError: (error) => {
      if (error instanceof ApiClientError && error.code === "DUPLICATE") {
        return
      }

      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Không cập nhật được hồ sơ. Vui lòng thử lại.",
      )
    },
  })
}
