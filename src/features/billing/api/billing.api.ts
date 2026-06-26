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

// Staff/Admin xac nhan thanh toan cho 1 membership pending -> active + tao hoa don.
export async function confirmMembershipPayment(
  accessToken: string,
  membershipId: number,
  amount: number,
  method = "cash",
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/v1/memberships/${membershipId}/payment`,
    {
      method: "POST",
      headers: {
        ...authHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, method }),
    },
  )
}

// FR-MS-08 — huy membership (member: don/goi cua minh; staff/admin: bat ky).
export async function cancelMembership(
  accessToken: string,
  membershipId: number,
): Promise<unknown> {
  return apiRequest<unknown>(`/api/v1/memberships/${membershipId}/cancel`, {
    method: "POST",
    headers: authHeaders(accessToken),
  })
}

// Backend tra ve PackageResponse { ..., isActive, supportsPT }; FE dung { ..., status, supportsPT }.
// Chuan hoa isActive -> status de toan UI dung 1 kieu duy nhat.
type RawPackage = {
  id: number
  name: string
  durationDays: number
  price: number
  status?: "active" | "inactive"
  isActive?: boolean
  supportsPT?: boolean
}

function normalizePackage(pkg: RawPackage): GymPackage {
  return {
    id: pkg.id,
    name: pkg.name,
    durationDays: pkg.durationDays,
    price: pkg.price,
    status: pkg.status ?? (pkg.isActive ? "active" : "inactive"),
    supportsPT: pkg.supportsPT ?? false,
  }
}

export async function getPackages(accessToken: string): Promise<GymPackage[]> {
  const raw = await apiRequest<RawPackage[]>("/api/v1/packages", {
    headers: authHeaders(accessToken),
  })
  return raw.map(normalizePackage)
}

// Tao goi moi: backend nhan { name, durationDays, price, supportsPT }, luon tao IsActive=true.
export async function createPackage(
  accessToken: string,
  draft: CreatePackageDraft,
): Promise<GymPackage> {
  const raw = await apiRequest<RawPackage>("/api/v1/packages", {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: draft.name,
      durationDays: draft.durationDays,
      price: draft.price,
      supportsPT: draft.supportsPT,
    }),
  })
  return normalizePackage(raw)
}

// Sua goi: backend nhan isActive (bool) + supportsPT, KHONG nhan "status" chuoi.
// Map status -> isActive thi nut Tam dung / Kich hoat goi moi co tac dung.
export async function updatePackage(
  accessToken: string,
  packageId: number,
  draft: CreatePackageDraft,
): Promise<GymPackage> {
  const raw = await apiRequest<RawPackage>(`/api/v1/packages/${packageId}`, {
    method: "PUT",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: draft.name,
      durationDays: draft.durationDays,
      price: draft.price,
      isActive: draft.status === "active",
      supportsPT: draft.supportsPT,
    }),
  })
  return normalizePackage(raw)
}

// Backend tra status enum kieu PascalCase (PendingPayment/Active/...) -> chuan hoa snake_case.
function normalizeMembershipStatus(status: string): Membership["status"] {
  switch (status?.toLowerCase()) {
    case "pendingpayment":
    case "pending_payment":
    case "pending":
      return "pending_payment"
    case "active":
      return "active"
    case "expired":
      return "expired"
    case "cancelled":
    case "canceled":
      return "cancelled"
    default:
      return status as Membership["status"]
  }
}

export async function getMemberships(accessToken: string): Promise<Membership[]> {
  // Backend that tra paged {items,...}; mock cu tra mang phang -> chap nhan ca 2.
  const data = await apiRequest<Membership[] | { items: Membership[] }>(
    "/api/v1/memberships",
    {
      headers: authHeaders(accessToken),
    },
  )
  const list = Array.isArray(data) ? data : data.items
  return list.map((ms) => ({
    ...ms,
    status: normalizeMembershipStatus(ms.status as string),
  }))
}

// Backend tra payment status PascalCase (Paid/Pending/Refunded) -> chuan hoa.
function normalizePaymentStatus(status: string): Payment["status"] {
  switch (status?.toLowerCase()) {
    case "paid":
      return "paid"
    case "pending":
      return "pending"
    case "refunded":
      return "refunded"
    default:
      return status as Payment["status"]
  }
}

function normalizePayment(p: Payment): Payment {
  return {
    ...p,
    status: normalizePaymentStatus(p.status as string),
    membershipStatus: p.membershipStatus
      ? normalizeMembershipStatus(p.membershipStatus as string)
      : undefined,
  }
}

export async function getPayments(accessToken: string): Promise<Payment[]> {
  // Backend that tra paged {items,...} (GET /payments co page/pageSize);
  // mock cu tra mang phang -> chap nhan ca 2 de tranh ".map is not a function".
  const data = await apiRequest<Payment[] | { items: Payment[] }>(
    "/api/v1/payments",
    {
      headers: authHeaders(accessToken),
    },
  )
  const list = Array.isArray(data) ? data : data.items
  return list.map(normalizePayment)
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
  const list = await apiRequest<Payment[]>(
    `/api/v1/members/${memberId}/payments`,
    {
      headers: authHeaders(accessToken),
    },
  )
  return list.map(normalizePayment)
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
