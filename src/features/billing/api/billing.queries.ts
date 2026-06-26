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
  getCheckInsByDate,
  createRenewalRequest,
  getPaymentsSummary,
  confirmMembershipPayment,
  cancelMembership,
} from "@/features/billing/api/billing.api"
import type { CreatePackageDraft } from "@/features/billing/types/billing.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { invalidateMembershipEntities } from "@/lib/query/invalidate-entities"

export const billingKeys = {
  all: ["billing"] as const,
  packages: () => [...billingKeys.all, "packages"] as const,
  memberships: () => [...billingKeys.all, "memberships"] as const,
  payments: () => [...billingKeys.all, "payments"] as const,
  paymentsSummary: () => [...billingKeys.all, "payments-summary"] as const,
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

// Spec 003 / ADR-05 — member gui yeu cau gia han
export function useCreateRenewalRequest() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (packageId: number) =>
      createRenewalRequest(accessToken ?? "", packageId),
    // Member mua/gia han -> the goi (member-360) phai doi ngay, khong cho F5.
    onSuccess: () => invalidateMembershipEntities(queryClient),
  })
}

// Staff/Admin xac nhan thanh toan cho membership pending
export function useConfirmMembershipPayment() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { membershipId: number; amount: number }) =>
      confirmMembershipPayment(accessToken ?? "", vars.membershipId, vars.amount),
    onSuccess: () => invalidateMembershipEntities(queryClient),
  })
}

// FR-MS-08 — huy membership.
export function useCancelMembership() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (membershipId: number) =>
      cancelMembership(accessToken ?? "", membershipId),
    onSuccess: () => invalidateMembershipEntities(queryClient),
  })
}

// Spec 003 §6 — bao cao doanh thu
export function usePaymentsSummary() {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: billingKeys.paymentsSummary(),
    queryFn: () => getPaymentsSummary(accessToken ?? ""),
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

export function useCheckInsByDate(date: string) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: [...billingKeys.all, "checkins-by-date", date],
    queryFn: () => getCheckInsByDate(accessToken ?? "", date),
    enabled: Boolean(accessToken) && Boolean(date),
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
