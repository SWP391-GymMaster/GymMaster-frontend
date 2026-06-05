import { apiRequest } from "@/lib/api/http-client"
import type {
  AssignmentCandidateMember,
  AssignmentCandidateResponse,
  AssignmentCandidateTrainer,
  AssignTrainerInput,
  AssignTrainerResult,
} from "@/features/pt-assignment/types/pt-assignment.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

function withSearchParams(path: string, params: Record<string, string | boolean | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return query ? `${path}?${query}` : path
}

export function getAssignmentCandidateMembers(
  accessToken: string,
  query: string,
  includeAssigned = true,
) {
  return apiRequest<AssignmentCandidateResponse<AssignmentCandidateMember>>(
    withSearchParams("/api/v1/assignments/candidates/members", {
      includeAssigned,
      query,
    }),
    {
      headers: authHeaders(accessToken),
    },
  )
}

export function getAssignmentCandidateTrainers(
  accessToken: string,
  query: string,
  specialty?: string,
) {
  return apiRequest<AssignmentCandidateResponse<AssignmentCandidateTrainer>>(
    withSearchParams("/api/v1/assignments/candidates/trainers", {
      query,
      specialty,
    }),
    {
      headers: authHeaders(accessToken),
    },
  )
}

export function assignTrainer(accessToken: string, input: AssignTrainerInput) {
  return apiRequest<AssignTrainerResult>("/api/v1/assignments", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  })
}
