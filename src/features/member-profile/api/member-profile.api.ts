import { apiRequest } from "@/lib/api/http-client"
import type {
  MyProfile,
  UpdateMyProfileInput,
} from "@/features/member-profile/types/member-profile.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

type RawMyProfile = {
  Id?: number
  id?: number
  UserId?: number
  userId?: number
  MemberCode?: string
  memberCode?: string
  Email?: string
  email?: string
  FullName?: string
  fullName?: string
  AvatarUrl?: string | null
  avatarUrl?: string | null
  Phone?: string | null
  phone?: string | null
  DateOfBirth?: string | null
  dateOfBirth?: string | null
  Gender?: string | null
  gender?: string | null
  Address?: string | null
  address?: string | null
  EmergencyContact?: string | null
  emergencyContact?: string | null
  JoinedAt?: string
  joinedAt?: string
  Status?: string
  status?: string
  CreatedAt?: string
  createdAt?: string
}

function normalizeProfile(raw: RawMyProfile): MyProfile {
  return {
    id: raw.Id ?? raw.id ?? 0,
    userId: raw.UserId ?? raw.userId ?? 0,
    memberCode: raw.MemberCode ?? raw.memberCode ?? "",
    email: raw.Email ?? raw.email ?? "",
    fullName: raw.FullName ?? raw.fullName ?? "",
    avatarUrl: raw.AvatarUrl ?? raw.avatarUrl ?? null,
    phone: raw.Phone ?? raw.phone ?? null,
    dateOfBirth: raw.DateOfBirth ?? raw.dateOfBirth ?? null,
    gender: raw.Gender ?? raw.gender ?? null,
    address: raw.Address ?? raw.address ?? null,
    emergencyContact: raw.EmergencyContact ?? raw.emergencyContact ?? null,
    joinedAt: raw.JoinedAt ?? raw.joinedAt ?? "",
    status: raw.Status ?? raw.status ?? "",
    createdAt: raw.CreatedAt ?? raw.createdAt ?? "",
  }
}

function toUpdatePayload(input: UpdateMyProfileInput) {
  const payload: Record<string, string | null> = {}

  if ("fullName" in input) payload.FullName = input.fullName ?? null
  if ("phone" in input) payload.Phone = input.phone ?? null
  if ("dateOfBirth" in input) payload.DateOfBirth = input.dateOfBirth ?? null
  if ("gender" in input) payload.Gender = input.gender ?? null
  if ("address" in input) payload.Address = input.address ?? null
  if ("emergencyContact" in input) {
    payload.EmergencyContact = input.emergencyContact ?? null
  }

  return payload
}

export async function getMyProfile(accessToken: string): Promise<MyProfile> {
  const raw = await apiRequest<RawMyProfile>("/api/v1/members/me", {
    headers: authHeaders(accessToken),
  })

  return normalizeProfile(raw)
}

export async function updateMyProfile(
  accessToken: string,
  input: UpdateMyProfileInput,
): Promise<MyProfile> {
  const raw = await apiRequest<RawMyProfile>("/api/v1/members/me", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(toUpdatePayload(input)),
  })

  return normalizeProfile(raw)
}
