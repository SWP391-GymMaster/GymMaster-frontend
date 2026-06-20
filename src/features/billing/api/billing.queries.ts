"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getPackages,
  createPackage,
  updatePackage,
  getMemberships,
  getPayments,
  getMemberPayments,
  getMemberCheckIns,
} from "@/features/billing/api/billing.api"
import type { CreatePackageDraft } from "@/features/billing/types/billing.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const billingKeys = {
  all: ["billing"] as const,
  packages: () => [...billingKeys.all, "packages"] as const,
  memberships: () => [...billingKeys.all, "memberships"] as const,
  payments: () => [...billingKeys.all, "payments"] as const,
  memberPayments: (memberId: number) => [...billingKeys.all, "member-payments", memberId] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useCurrentMemberProfileId() {
  return useAuthSessionStore((state) => {
    if (state.session?.role !== "member") {
      return null
    }

    return state.session?.user?.memberProfileId ?? null;
  })
}

export function usePackages() {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: billingKeys.packages(),
    queryFn: () => getPackages(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}

export function useCreatePackage() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: CreatePackageDraft) => createPackage(accessToken ?? "", draft),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: billingKeys.packages(),
      })
    },
  })
}

export function useUpdatePackage() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packageId, draft }: { packageId: number; draft: CreatePackageDraft }) =>
      updatePackage(accessToken ?? "", packageId, draft),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: billingKeys.packages(),
      })
    },
  })
}

export function useMemberships() {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: billingKeys.memberships(),
    queryFn: () => getMemberships(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}

export function usePayments() {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: billingKeys.payments(),
    queryFn: () => getPayments(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}

export function useMemberPayments(memberId: number | null) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: billingKeys.memberPayments(memberId ?? 0),
    queryFn: () => getMemberPayments(accessToken ?? "", memberId ?? 0),
    enabled: Boolean(accessToken) && Boolean(memberId),
  })
}

export function useMemberCheckIns(memberId: number | null) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: [...billingKeys.all, "member-checkins", memberId ?? 0],
    queryFn: () => getMemberCheckIns(accessToken ?? "", memberId ?? 0),
    enabled: Boolean(accessToken) && Boolean(memberId),
  })
}
