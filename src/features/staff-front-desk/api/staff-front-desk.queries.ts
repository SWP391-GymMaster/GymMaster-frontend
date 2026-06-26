"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createStaffCheckIn,
  getStaffMemberDetail,
  getStaffPackages,
  recordStaffManualPayment,
  renewStaffMembership,
  searchStaffMembers,
  sellStaffMembership,
} from "@/features/staff-front-desk/api/staff-front-desk.api"
import type {
  ManualPaymentDraft,
  RenewPackageDraft,
  SellPackageDraft,
} from "@/features/staff-front-desk/types/staff-front-desk.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { invalidateMembershipEntities } from "@/lib/query/invalidate-entities"

export const staffFrontDeskKeys = {
  all: ["staff-front-desk"] as const,
  members: (query: string) =>
    [...staffFrontDeskKeys.all, "members", query] as const,
  memberDetail: (id: number) =>
    [...staffFrontDeskKeys.all, "member-detail", id] as const,
  packages: () => [...staffFrontDeskKeys.all, "packages"] as const,
}

function useStaffAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useStaffMemberSearch(query: string) {
  const accessToken = useStaffAccessToken()
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: staffFrontDeskKeys.members(normalizedQuery),
    queryFn: () => searchStaffMembers(accessToken ?? "", normalizedQuery),
    enabled: Boolean(accessToken) && normalizedQuery.length >= 2,
  })
}

export function useStaffMemberDetail(memberId: number | null) {
  const accessToken = useStaffAccessToken()

  return useQuery({
    queryKey: memberId
      ? staffFrontDeskKeys.memberDetail(memberId)
      : [...staffFrontDeskKeys.all, "member-detail", "none"],
    queryFn: () => getStaffMemberDetail(accessToken ?? "", memberId ?? 0),
    enabled: Boolean(accessToken) && Boolean(memberId),
  })
}

export function useStaffPackages() {
  const accessToken = useStaffAccessToken()

  return useQuery({
    queryKey: staffFrontDeskKeys.packages(),
    queryFn: () => getStaffPackages(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}

export function useSellStaffMembership() {
  const accessToken = useStaffAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: SellPackageDraft) =>
      sellStaffMembership(accessToken ?? "", draft),
    onSuccess: () => invalidateMembershipEntities(queryClient),
  })
}

export function useRenewStaffMembership() {
  const accessToken = useStaffAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: RenewPackageDraft) =>
      renewStaffMembership(accessToken ?? "", draft),
    onSuccess: () => invalidateMembershipEntities(queryClient),
  })
}

export function useRecordStaffManualPayment() {
  const accessToken = useStaffAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: ManualPaymentDraft) =>
      recordStaffManualPayment(accessToken ?? "", draft),
    onSuccess: () => invalidateMembershipEntities(queryClient),
  })
}

export function useCreateStaffCheckIn() {
  const accessToken = useStaffAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: number) => createStaffCheckIn(accessToken ?? "", memberId),
    onSuccess: () => invalidateMembershipEntities(queryClient),
  })
}
