"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  getMyTrainerProfile,
  postMyAvatar,
  putMyAccount,
  type UpdateMyAccountInput,
} from "@/features/account/api/account.api"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { member360Keys } from "@/features/member-360/api/member-360.queries"
import { memberProfileKeys } from "@/features/member-profile/api/member-profile.queries"
import type { MyProfile } from "@/features/member-profile/types/member-profile.types"
import { ApiClientError } from "@/lib/api/http-client"
import type { AuthUser } from "@/types/auth"

export const accountKeys = {
  all: ["account"] as const,
  trainerMe: () => [...accountKeys.all, "trainer-me"] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

function syncSessionUser(user: AuthUser) {
  const { session, setSession } = useAuthSessionStore.getState()

  if (!session) {
    return
  }

  setSession({
    ...session,
    user: {
      ...session.user,
      ...user,
      role: session.role,
    },
  })
}

function syncMemberProfileQuery(
  queryClient: ReturnType<typeof useQueryClient>,
  user: AuthUser,
) {
  queryClient.setQueryData<MyProfile | undefined>(
    memberProfileKeys.me(),
    (profile) =>
      profile
        ? {
            ...profile,
            fullName: user.fullName || profile.fullName,
            phone: user.phone ?? profile.phone,
            avatarUrl: user.avatarUrl ?? profile.avatarUrl,
          }
        : profile,
  )
}

async function invalidateAccountSurfaces(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const session = useAuthSessionStore.getState().session

  if (session?.role !== "member") {
    return
  }

  await queryClient.invalidateQueries({ queryKey: memberProfileKeys.me() })

  if (session.user.memberProfileId) {
    await queryClient.invalidateQueries({
      queryKey: member360Keys.detail(session.user.memberProfileId),
    })
  }
}

export function useUpdateMyAccount() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMyAccountInput) =>
      putMyAccount(accessToken ?? "", input),
    onSuccess: async (user) => {
      syncSessionUser(user)
      syncMemberProfileQuery(queryClient, user)
      await invalidateAccountSurfaces(queryClient)
      toast.success("Đã cập nhật tài khoản.")
    },
    onError: (error) => {
      if (error instanceof ApiClientError && error.code === "DUPLICATE") {
        return
      }

      if (error instanceof Error) {
        toast.error(error.message)
        return
      }

      toast.error("Không cập nhật được tài khoản. Vui lòng thử lại.")
    },
  })
}

export function useUploadMyAvatar() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => postMyAvatar(accessToken ?? "", file),
    onSuccess: async (user) => {
      syncSessionUser(user)
      syncMemberProfileQuery(queryClient, user)
      await invalidateAccountSurfaces(queryClient)
      toast.success("Đã cập nhật ảnh đại diện.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Không tải được ảnh đại diện. Vui lòng thử lại.",
      )
    },
  })
}

export function useMyTrainerProfile(options?: { enabled?: boolean }) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: accountKeys.trainerMe(),
    queryFn: () => getMyTrainerProfile(accessToken ?? ""),
    enabled: Boolean(accessToken) && (options?.enabled ?? true),
    retry: false,
  })
}
