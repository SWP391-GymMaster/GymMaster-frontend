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

export type MyPersonalProfile = {
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  emergencyContact: string | null
}

export type UpdateMyPersonalProfileInput = Partial<{
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  emergencyContact: string | null
}>

export type MyTrainerProfile = {
  id: number
  userId: number
  email: string
  fullName: string
  status: string
  specialty: string | null
  bio: string | null
  gender: string | null
  dateOfBirth: string | null
  yearsOfExperience: number | null
  createdAt: string
}

type RawPersonalProfile = {
  DateOfBirth?: string | null
  dateOfBirth?: string | null
  Gender?: string | null
  gender?: string | null
  Address?: string | null
  address?: string | null
  EmergencyContact?: string | null
  emergencyContact?: string | null
}

type RawTrainerProfile = {
  Id?: number
  id?: number
  UserId?: number
  userId?: number
  Email?: string
  email?: string
  FullName?: string
  fullName?: string
  Status?: string
  status?: string
  Specialty?: string | null
  specialty?: string | null
  Bio?: string | null
  bio?: string | null
  Gender?: string | null
  gender?: string | null
  DateOfBirth?: string | null
  dateOfBirth?: string | null
  YearsOfExperience?: number | null
  yearsOfExperience?: number | null
  CreatedAt?: string
  createdAt?: string
}

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

function toPersonalProfilePayload(input: UpdateMyPersonalProfileInput) {
  const payload: Record<string, string | null> = {}

  if ("dateOfBirth" in input) {
    payload.DateOfBirth = input.dateOfBirth || null
  }

  if ("gender" in input) {
    payload.Gender = input.gender?.trim() || null
  }

  if ("address" in input) {
    payload.Address = input.address?.trim() || null
  }

  if ("emergencyContact" in input) {
    payload.EmergencyContact = input.emergencyContact?.trim() || null
  }

  return payload
}

function normalizePersonalProfile(raw: RawPersonalProfile): MyPersonalProfile {
  return {
    dateOfBirth: raw.DateOfBirth ?? raw.dateOfBirth ?? null,
    gender: raw.Gender ?? raw.gender ?? null,
    address: raw.Address ?? raw.address ?? null,
    emergencyContact: raw.EmergencyContact ?? raw.emergencyContact ?? null,
  }
}

function normalizeTrainerProfile(raw: RawTrainerProfile): MyTrainerProfile {
  return {
    id: raw.Id ?? raw.id ?? 0,
    userId: raw.UserId ?? raw.userId ?? 0,
    email: raw.Email ?? raw.email ?? "",
    fullName: raw.FullName ?? raw.fullName ?? "",
    status: raw.Status ?? raw.status ?? "",
    specialty: raw.Specialty ?? raw.specialty ?? null,
    bio: raw.Bio ?? raw.bio ?? null,
    gender: raw.Gender ?? raw.gender ?? null,
    dateOfBirth: raw.DateOfBirth ?? raw.dateOfBirth ?? null,
    yearsOfExperience: raw.YearsOfExperience ?? raw.yearsOfExperience ?? null,
    createdAt: raw.CreatedAt ?? raw.createdAt ?? "",
  }
}

export async function getMyPersonalProfile(
  accessToken: string,
): Promise<MyPersonalProfile> {
  const raw = await apiRequest<RawPersonalProfile>("/api/v1/users/me/profile", {
    headers: authHeaders(accessToken),
  })

  return normalizePersonalProfile(raw)
}

export async function putMyPersonalProfile(
  accessToken: string,
  input: UpdateMyPersonalProfileInput,
): Promise<MyPersonalProfile> {
  const raw = await apiRequest<RawPersonalProfile>("/api/v1/users/me/profile", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(toPersonalProfilePayload(input)),
  })

  return normalizePersonalProfile(raw)
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

export async function getMyTrainerProfile(
  accessToken: string,
): Promise<MyTrainerProfile> {
  const raw = await apiRequest<RawTrainerProfile>("/api/v1/trainers/me", {
    headers: authHeaders(accessToken),
  })

  return normalizeTrainerProfile(raw)
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
