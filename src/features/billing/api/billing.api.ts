import { apiRequest } from "@/lib/api/http-client"
import type {
  GymPackage,
  Membership,
  Payment,
  CreatePackageDraft,
} from "@/features/billing/types/billing.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function getPackages(accessToken: string): Promise<GymPackage[]> {
  return apiRequest<GymPackage[]>("/api/packages", {
    headers: authHeaders(accessToken),
  })
}

export async function createPackage(
  accessToken: string,
  draft: CreatePackageDraft,
): Promise<GymPackage> {
  return apiRequest<GymPackage>("/api/packages", {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(draft),
  })
}

export async function updatePackage(
  accessToken: string,
  packageId: number,
  draft: CreatePackageDraft,
): Promise<GymPackage> {
  return apiRequest<GymPackage>(`/api/packages/${packageId}`, {
    method: "PUT",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(draft),
  })
}

export async function getMemberships(accessToken: string): Promise<Membership[]> {
  return apiRequest<Membership[]>("/api/memberships", {
    headers: authHeaders(accessToken),
  })
}

export async function getPayments(accessToken: string): Promise<Payment[]> {
  return apiRequest<Payment[]>("/api/payments", {
    headers: authHeaders(accessToken),
  })
}

export async function getMemberPayments(
  accessToken: string,
  memberId: number,
): Promise<Payment[]> {
  return apiRequest<Payment[]>(`/api/members/${memberId}/payments`, {
    headers: authHeaders(accessToken),
  })
}

export async function getMemberCheckIns(
  accessToken: string,
  memberId: number,
): Promise<Array<{ id: number; checkInAt: string; source: string }>> {
  return apiRequest<Array<{ id: number; checkInAt: string; source: string }>>(
    `/api/members/${memberId}/checkins`,
    {
      headers: authHeaders(accessToken),
    },
  )
}
