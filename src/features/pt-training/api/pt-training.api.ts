import { apiRequest } from "@/lib/api/http-client"
import type {
  TrainerNote,
  TrainerNoteDraft,
  WorkoutPlan,
  WorkoutPlanDraft,
} from "@/features/pt-training/types/pt-training.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export function getMemberWorkoutPlans(accessToken: string, memberId: number) {
  return apiRequest<WorkoutPlan[]>(
    `/api/v1/members/${memberId}/workout-plans`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export function getMyWorkoutPlans(accessToken: string) {
  return apiRequest<WorkoutPlan[]>(`/api/v1/members/me/workout-plans`, {
    headers: authHeaders(accessToken),
  })
}

export function createMemberWorkoutPlan(
  accessToken: string,
  memberId: number,
  draft: WorkoutPlanDraft,
) {
  return apiRequest<WorkoutPlan>(
    `/api/v1/members/${memberId}/workout-plans`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(draft),
    },
  )
}

export function getMemberTrainerNotes(accessToken: string, memberId: number) {
  return apiRequest<TrainerNote[]>(`/api/v1/members/${memberId}/notes`, {
    headers: authHeaders(accessToken),
  })
}

export function getMyTrainerNotes(accessToken: string) {
  return apiRequest<TrainerNote[]>(`/api/v1/members/me/notes`, {
    headers: authHeaders(accessToken),
  })
}

export function createMemberTrainerNote(
  accessToken: string,
  memberId: number,
  draft: TrainerNoteDraft,
) {
  return apiRequest<TrainerNote>(`/api/v1/members/${memberId}/notes`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(draft),
  })
}
