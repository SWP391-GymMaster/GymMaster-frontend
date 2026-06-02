import { apiRequest } from "@/lib/api/http-client"
import type {
  CreateMemberInput,
  CreateTrainerInput,
  CreateUserInput,
  ManagedMember,
  ManagedTrainer,
  ManagedUser,
  PagedResult,
  UpdateMemberInput,
} from "@/features/member-management/types/member-management.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export function getManagedMembers(accessToken: string, query = "", page = 1) {
  return apiRequest<PagedResult<ManagedMember>>(
    `/api/members?query=${encodeURIComponent(query)}&page=${page}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export function createManagedMember(
  accessToken: string,
  input: CreateMemberInput,
) {
  return apiRequest<ManagedMember>("/api/members", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  })
}

export function updateManagedMember(
  accessToken: string,
  memberId: number,
  input: UpdateMemberInput,
) {
  return apiRequest<ManagedMember>(`/api/members/${memberId}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  })
}

export function deleteManagedMember(accessToken: string, memberId: number) {
  return apiRequest<void>(`/api/members/${memberId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  })
}

export function getManagedUsers(
  accessToken: string,
  role?: "staff" | "pt" | "member",
  query = "",
  page = 1,
) {
  const params = new URLSearchParams({
    page: String(page),
    query,
  })

  if (role) {
    params.set("role", role)
  }

  return apiRequest<PagedResult<ManagedUser>>(`/api/v1/users?${params}`, {
    headers: authHeaders(accessToken),
  })
}

export function createManagedUser(accessToken: string, input: CreateUserInput) {
  return apiRequest<ManagedUser>("/api/v1/users", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  })
}

export function getManagedTrainers(accessToken: string, query = "", page = 1) {
  return apiRequest<PagedResult<ManagedTrainer>>(
    `/api/trainers?query=${encodeURIComponent(query)}&page=${page}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export function createManagedTrainer(
  accessToken: string,
  input: CreateTrainerInput,
) {
  return apiRequest<ManagedTrainer>("/api/trainers", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  })
}
