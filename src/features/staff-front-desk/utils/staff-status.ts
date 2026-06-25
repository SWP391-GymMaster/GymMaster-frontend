import type { Status } from "@/components/data/StatusPill"
import type {
  MockMembershipDto,
  MockPackageDto,
  StaffMembershipStatus,
} from "@/features/staff-front-desk/types/staff-front-desk.types"

export function normalizeMembershipStatus(status?: string): StaffMembershipStatus {
  switch (status?.toLowerCase()) {
    case "active":
      return "active"
    case "pending":
    case "pendingpayment":
    case "pending_payment":
      return "pending"
    case "expired":
      return "expired"
    case "locked":
      return "locked"
    case "cancelled":
    case "canceled":
      return "cancelled"
    default:
      return "unknown"
  }
}

export function toStatusPillStatus(status: StaffMembershipStatus): Status {
  if (status === "unknown") return "unknown"
  return status
}

export function paymentStatusFromMembership(status?: string) {
  const normalized = normalizeMembershipStatus(status)

  if (normalized === "active") return "paid"
  if (normalized === "pending") return "pending"
  if (normalized === "cancelled") return "cancelled"

  return "unknown"
}

export function getPackageName(
  packageId: number | undefined,
  packages: MockPackageDto[],
) {
  return packages.find((item) => item.id === packageId)?.name
}

export function getCurrentMembership(
  memberId: number,
  memberships: MockMembershipDto[],
) {
  const memberMemberships = memberships.filter((item) => item.memberId === memberId)
  const today = new Date().toISOString().slice(0, 10)

  // "Goi hien tai" thong nhat voi BE: uu tien Active con han (EndDate lon nhat),
  // roi PendingPayment moi nhat, cuoi cung fallback dong moi nhat. Khong boc nham dong da huy.
  const activeValid = memberMemberships
    .filter(
      (item) =>
        normalizeMembershipStatus(item.status) === "active" && item.endDate >= today,
    )
    .sort((a, b) => b.endDate.localeCompare(a.endDate))

  if (activeValid.length > 0) return activeValid[0]

  const pending = memberMemberships
    .filter((item) => normalizeMembershipStatus(item.status) === "pending")
    .sort((a, b) => b.id - a.id)

  if (pending.length > 0) return pending[0]

  return [...memberMemberships].sort((a, b) => b.id - a.id).at(0)
}
