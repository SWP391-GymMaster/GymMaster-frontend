"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createManagedMember,
  createManagedTrainer,
  createManagedUser,
  deleteManagedMember,
  getManagedMembers,
  getManagedTrainers,
  getManagedUsers,
  updateManagedMember,
} from "@/features/member-management/api/member-management.api"
import type {
  CreateMemberInput,
  CreateTrainerInput,
  CreateUserInput,
  UpdateMemberInput,
} from "@/features/member-management/types/member-management.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const memberManagementKeys = {
  all: ["member-management"] as const,
  members: (query: string) =>
    [...memberManagementKeys.all, "members", query] as const,
  users: (role: string, query: string) =>
    [...memberManagementKeys.all, "users", role, query] as const,
  trainers: (query: string) =>
    [...memberManagementKeys.all, "trainers", query] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useManagedMembers(query: string) {
  const accessToken = useAccessToken()
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: memberManagementKeys.members(normalizedQuery),
    queryFn: () => getManagedMembers(accessToken ?? "", normalizedQuery),
    enabled: Boolean(accessToken),
  })
}

export function useManagedUsers(
  role: "staff" | "pt" | "member" | undefined,
  query: string,
) {
  const accessToken = useAccessToken()
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: memberManagementKeys.users(role ?? "all", normalizedQuery),
    queryFn: () => getManagedUsers(accessToken ?? "", role, normalizedQuery),
    enabled: Boolean(accessToken),
  })
}

export function useManagedTrainers(query: string) {
  const accessToken = useAccessToken()
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: memberManagementKeys.trainers(normalizedQuery),
    queryFn: () => getManagedTrainers(accessToken ?? "", normalizedQuery),
    enabled: Boolean(accessToken),
  })
}

export function useCreateManagedMember() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMemberInput) =>
      createManagedMember(accessToken ?? "", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberManagementKeys.all })
    },
  })
}

export function useUpdateManagedMember() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      input,
      memberId,
    }: {
      input: UpdateMemberInput
      memberId: number
    }) => updateManagedMember(accessToken ?? "", memberId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberManagementKeys.all })
    },
  })
}

export function useDeleteManagedMember() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: number) =>
      deleteManagedMember(accessToken ?? "", memberId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberManagementKeys.all })
    },
  })
}

export function useCreateManagedUser() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      createManagedUser(accessToken ?? "", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberManagementKeys.all })
    },
  })
}

export function useCreateManagedTrainer() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTrainerInput) =>
      createManagedTrainer(accessToken ?? "", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberManagementKeys.all })
    },
  })
}
