"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createMemberTrainerNote,
  createMemberWorkoutPlan,
  getMemberTrainerNotes,
  getMemberWorkoutPlans,
  getMyTrainerNotes,
  getMyWorkoutPlans,
} from "@/features/pt-training/api/pt-training.api"
import type {
  TrainerNoteDraft,
  WorkoutPlanDraft,
} from "@/features/pt-training/types/pt-training.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const ptTrainingKeys = {
  all: ["pt-training"] as const,
  workoutPlans: (memberId: number) =>
    [...ptTrainingKeys.all, "workout-plans", memberId] as const,
  trainerNotes: (memberId: number) =>
    [...ptTrainingKeys.all, "trainer-notes", memberId] as const,
  myWorkoutPlans: [...["pt-training"], "my-workout-plans"] as const,
  myTrainerNotes: [...["pt-training"], "my-trainer-notes"] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useMemberWorkoutPlans(memberId: number | null) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: memberId
      ? ptTrainingKeys.workoutPlans(memberId)
      : [...ptTrainingKeys.all, "workout-plans", "none"],
    queryFn: () => getMemberWorkoutPlans(accessToken ?? "", memberId ?? 0),
    enabled: Boolean(accessToken) && Boolean(memberId),
  })
}

export function useCreateMemberWorkoutPlan(memberId: number) {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: WorkoutPlanDraft) =>
      createMemberWorkoutPlan(accessToken ?? "", memberId, draft),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ptTrainingKeys.workoutPlans(memberId),
      })
    },
  })
}

export function useMemberTrainerNotes(memberId: number | null) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: memberId
      ? ptTrainingKeys.trainerNotes(memberId)
      : [...ptTrainingKeys.all, "trainer-notes", "none"],
    queryFn: () => getMemberTrainerNotes(accessToken ?? "", memberId ?? 0),
    enabled: Boolean(accessToken) && Boolean(memberId),
  })
}

export function useCreateMemberTrainerNote(memberId: number) {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: TrainerNoteDraft) =>
      createMemberTrainerNote(accessToken ?? "", memberId, draft),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ptTrainingKeys.trainerNotes(memberId),
      })
    },
  })
}

export function useMyWorkoutPlans() {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: ptTrainingKeys.myWorkoutPlans,
    queryFn: () => getMyWorkoutPlans(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}

export function useMyTrainerNotes() {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: ptTrainingKeys.myTrainerNotes,
    queryFn: () => getMyTrainerNotes(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}
