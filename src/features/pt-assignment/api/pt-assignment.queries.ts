"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  assignTrainer,
  getAssignmentCandidateMembers,
  getAssignmentCandidateTrainers,
} from "@/features/pt-assignment/api/pt-assignment.api"
import type { AssignTrainerInput } from "@/features/pt-assignment/types/pt-assignment.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { ptTrainingKeys } from "@/features/pt-training/api/pt-training.queries"

export const ptAssignmentKeys = {
  all: ["pt-assignment"] as const,
  members: (query: string, includeAssigned: boolean) =>
    [...ptAssignmentKeys.all, "members", query, includeAssigned] as const,
  trainers: (query: string, specialty: string) =>
    [...ptAssignmentKeys.all, "trainers", query, specialty] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useAssignmentCandidateMembers(
  query: string,
  includeAssigned = true,
) {
  const accessToken = useAccessToken()
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: ptAssignmentKeys.members(normalizedQuery, includeAssigned),
    queryFn: () =>
      getAssignmentCandidateMembers(
        accessToken ?? "",
        normalizedQuery,
        includeAssigned,
      ),
    enabled: Boolean(accessToken),
  })
}

export function useAssignmentCandidateTrainers(
  query: string,
  specialty = "all",
) {
  const accessToken = useAccessToken()
  const normalizedQuery = query.trim()
  const normalizedSpecialty = specialty === "all" ? undefined : specialty

  return useQuery({
    queryKey: ptAssignmentKeys.trainers(normalizedQuery, specialty),
    queryFn: () =>
      getAssignmentCandidateTrainers(
        accessToken ?? "",
        normalizedQuery,
        normalizedSpecialty,
      ),
    enabled: Boolean(accessToken),
  })
}

export function useAssignTrainer() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AssignTrainerInput) =>
      assignTrainer(accessToken ?? "", input),
    onSuccess: async (_result, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ptAssignmentKeys.all }),
        queryClient.invalidateQueries({ queryKey: ptTrainingKeys.all }),
        queryClient.invalidateQueries({
          queryKey: ptTrainingKeys.workoutPlans(input.memberId),
        }),
        queryClient.invalidateQueries({
          queryKey: ptTrainingKeys.trainerNotes(input.memberId),
        }),
      ])
    },
  })
}
