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
  return apiRequest<GymPackage[]>("/api/v1/packages", {
    headers: authHeaders(accessToken),
  })
}

export async function createPackage(
  accessToken: string,
  draft: CreatePackageDraft,
): Promise<GymPackage> {
  return apiRequest<GymPackage>("/api/v1/packages", {
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
  return apiRequest<GymPackage>(`/api/v1/packages/${packageId}`, {
    method: "PUT",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(draft),
  })
}

export async function getMemberships(accessToken: string): Promise<Membership[]> {
  return apiRequest<Membership[]>("/api/v1/memberships", {
    headers: authHeaders(accessToken),
  })
}

export async function getPayments(accessToken: string): Promise<Payment[]> {
  return apiRequest<Payment[]>("/api/v1/payments", {
    headers: authHeaders(accessToken),
  })
}

export async function getMemberPayments(
  accessToken: string,
  memberId: number,
): Promise<Payment[]> {
  return apiRequest<Payment[]>(`/api/v1/members/${memberId}/payments`, {
    headers: authHeaders(accessToken),
  })
}

export async function getMemberCheckIns(
  accessToken: string,
  memberId: number,
): Promise<Array<{ id: number; checkInAt: string; source: string }>> {
  return apiRequest<Array<{ id: number; checkInAt: string; source: string }>>(
    `/api/v1/members/${memberId}/checkins`,
    {
      headers: authHeaders(accessToken),
    },
  )
}
