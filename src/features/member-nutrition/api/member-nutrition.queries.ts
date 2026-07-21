"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createMemberMealLog,
  getMemberCalorieHistory,
  getMemberCalorieSummary,
  getMemberMealLogs,
  searchFoodItems,
  createCustomFoodItem,
  estimateFoodNutrition,
  searchFoodOnline,
  setMemberCalorieTarget,
  getMemberCalorieTarget,
} from "@/features/member-nutrition/api/member-nutrition.api"
import type { CreateMealLogDraft, CreateCustomFoodInput, SetCalorieTargetInput, CalorieTarget } from "@/features/member-nutrition/types/member-nutrition.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const memberNutritionKeys = {
  all: ["member-nutrition"] as const,
  target: (memberId: number) => [...memberNutritionKeys.all, "target", memberId] as const,
  foods: (query: string) => [...memberNutritionKeys.all, "foods", query] as const,
  onlineSearch: (query: string) => [...memberNutritionKeys.all, "online-search", query] as const,
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

    return state.session?.user?.memberProfileId ?? null;
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

export function useEstimateFoodNutrition() {
  const accessToken = useMemberAccessToken()

  return useMutation({
    mutationFn: (name: string) =>
      estimateFoodNutrition(accessToken ?? "", name),
  })
}

// Spec 007 — dat muc tieu calo/macro cho member hien tai
export function useSetMemberCalorieTarget() {
  const accessToken = useMemberAccessToken()
  const memberId = useCurrentMemberProfileId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SetCalorieTargetInput) =>
      setMemberCalorieTarget(accessToken ?? "", memberId ?? 0, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: memberNutritionKeys.all,
      })
    },
  })
}

export function useMemberCalorieTarget() {
  const accessToken = useMemberAccessToken()
  const memberId = useCurrentMemberProfileId()
  return useQuery({
    queryKey: memberId ? memberNutritionKeys.target(memberId)
                       : [...memberNutritionKeys.all, "target", "none"],
    queryFn: async () => {
      try {
        return await getMemberCalorieTarget(accessToken ?? "", memberId ?? 0)
      } catch {
        return null   // 404/NO_TARGET = chưa đặt
      }
    },
    enabled: Boolean(accessToken) && Boolean(memberId),
    retry: false,
  })
}

export function useFoodOnlineSearch(query: string, enabled = false) {
  const accessToken = useMemberAccessToken()
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: memberNutritionKeys.onlineSearch(normalizedQuery),
    queryFn: () => searchFoodOnline(normalizedQuery, accessToken),
    enabled: enabled && normalizedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // cache 5 mins
    retry: false,
  })
}
