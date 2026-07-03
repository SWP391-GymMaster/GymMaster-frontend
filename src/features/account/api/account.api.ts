import {
  normalizeAuthUser,
  type RawAuthUser,
} from "@/features/auth/api/auth-normalizers"
import { apiRequest } from "@/lib/api/http-client"
import type { AuthUser } from "@/types/auth"

export type UpdateMyAccountInput = Partial<{
  fullName: string
  phone: string | null
}>

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

function toUpdatePayload(input: UpdateMyAccountInput) {
  const payload: Record<string, string | null> = {}

  if ("fullName" in input) {
    payload.FullName = input.fullName?.trim() ?? null
  }

  if ("phone" in input) {
    payload.Phone = input.phone?.trim() || null
  }

  return payload
}

export async function putMyAccount(
  accessToken: string,
  input: UpdateMyAccountInput,
): Promise<AuthUser> {
  const raw = await apiRequest<RawAuthUser>("/api/v1/users/me", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(toUpdatePayload(input)),
  })

  return normalizeAuthUser(raw)
}

export async function postMyAvatar(
  accessToken: string,
  file: File,
): Promise<AuthUser> {
  const formData = new FormData()
  formData.append("file", file)

  const raw = await apiRequest<RawAuthUser>("/api/v1/users/me/avatar", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: formData,
  })

  return normalizeAuthUser(raw)
}
