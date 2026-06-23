import { apiRequest } from "@/lib/api/http-client"
import type {
  GymPackage,
  Membership,
  Payment,
  CreatePackageDraft,
  RenewalRequestResult,
  PaymentSummary,
} from "@/features/billing/types/billing.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

// Spec 003 / ADR-05 — member tu gui yeu cau gia han (admin/staff xac nhan sau).
export async function createRenewalRequest(
  accessToken: string,
  packageId: number,
): Promise<RenewalRequestResult> {
  return apiRequest<RenewalRequestResult>(
    "/api/v1/memberships/renewal-request",
    {
      method: "POST",
      headers: {
        ...authHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ packageId }),
    },
  )
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
  // Backend that tra paged {items,...}; mock cu tra mang phang -> chap nhan ca 2.
  const data = await apiRequest<Membership[] | { items: Membership[] }>(
    "/api/v1/memberships",
    {
      headers: authHeaders(accessToken),
    },
  )
  return Array.isArray(data) ? data : data.items
}

export async function getPayments(accessToken: string): Promise<Payment[]> {
  return apiRequest<Payment[]>("/api/v1/payments", {
    headers: authHeaders(accessToken),
  })
}

// Spec 003 §6 — bao cao doanh thu
export async function getPaymentsSummary(
  accessToken: string,
): Promise<PaymentSummary> {
  return apiRequest<PaymentSummary>("/api/v1/payments/summary", {
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
