"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createMemberMealLog,
  getMemberCalorieHistory,
  getMemberCalorieSummary,
  getMemberMealLogs,
  searchFoodItems,
  createCustomFoodItem,
} from "@/features/member-nutrition/api/member-nutrition.api"
import type { CreateMealLogDraft, CreateCustomFoodInput } from "@/features/member-nutrition/types/member-nutrition.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const memberNutritionKeys = {
  all: ["member-nutrition"] as const,
  foods: (query: string) => [...memberNutritionKeys.all, "foods", query] as const,
  mealLogs: (memberId: number, date: string) =>
    [...memberNutritionKeys.all, "meal-logs", memberId, date] as const,
  summary: (memberId: number, date: string) =>
    [...memberNutritionKeys.all, "summary", memberId, date] as const,
  history: (memberId: number, from: string, to: string) =>
    [...memberNutritionKeys.all, "history", memberId, from, to] as const,
}

function useMemberAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useCurrentMemberProfileId() {
  return useAuthSessionStore((state) => {
    if (state.session?.role !== "member") {
      return null
    }

    if (state.session.user.email === "member@gymmaster.local") {
      return 101
    }

    return null
  })
}

export function useFoodSearch(query: string) {
  const accessToken = useMemberAccessToken()
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: memberNutritionKeys.foods(normalizedQuery),
    queryFn: () => searchFoodItems(accessToken ?? "", normalizedQuery),
    enabled: Boolean(accessToken) && normalizedQuery.length >= 2,
  })
}

export function useMemberMealLogs(date: string) {
  const accessToken = useMemberAccessToken()
  const memberId = useCurrentMemberProfileId()

  return useQuery({
    queryKey: memberId
      ? memberNutritionKeys.mealLogs(memberId, date)
      : [...memberNutritionKeys.all, "meal-logs", "none", date],
    queryFn: () => getMemberMealLogs(accessToken ?? "", memberId ?? 0, date),
    enabled: Boolean(accessToken) && Boolean(memberId) && Boolean(date),
  })
}

export function useMemberCalorieSummary(date: string) {
  const accessToken = useMemberAccessToken()
  const memberId = useCurrentMemberProfileId()

  return useQuery({
    queryKey: memberId
      ? memberNutritionKeys.summary(memberId, date)
      : [...memberNutritionKeys.all, "summary", "none", date],
    queryFn: () => getMemberCalorieSummary(accessToken ?? "", memberId ?? 0, date),
    enabled: Boolean(accessToken) && Boolean(memberId) && Boolean(date),
  })
}

export function useMemberCalorieHistory(from: string, to: string) {
  const accessToken = useMemberAccessToken()
  const memberId = useCurrentMemberProfileId()

  return useQuery({
    queryKey: memberId
      ? memberNutritionKeys.history(memberId, from, to)
      : [...memberNutritionKeys.all, "history", "none", from, to],
    queryFn: () =>
      getMemberCalorieHistory(accessToken ?? "", memberId ?? 0, from, to),
    enabled: Boolean(accessToken) && Boolean(memberId) && Boolean(from) && Boolean(to),
  })
}

export function useCreateMemberMealLog() {
  const accessToken = useMemberAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: CreateMealLogDraft) =>
      createMemberMealLog(accessToken ?? "", draft),
    onSuccess: async (mealLog) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: memberNutritionKeys.mealLogs(
            mealLog.memberId,
            mealLog.logDate,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: memberNutritionKeys.summary(mealLog.memberId, mealLog.logDate),
        }),
        queryClient.invalidateQueries({
          queryKey: memberNutritionKeys.all,
        }),
      ])
    },
  })
}

export function useCreateCustomFoodItem() {
  const accessToken = useMemberAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCustomFoodInput) =>
      createCustomFoodItem(accessToken ?? "", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...memberNutritionKeys.all, "foods"],
      })
    },
  })
}
