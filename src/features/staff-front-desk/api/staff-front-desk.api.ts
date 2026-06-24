import { apiRequest } from "@/lib/api/http-client"
import type {
  CheckInResult,
  CheckInSummary,
  ManualPaymentDraft,
  ManualPaymentResult,
  MembershipSnapshot,
  MockCheckInDto,
  MockMemberDto,
  MockMembershipDto,
  MockPackageDto,
  PackageOption,
  PagedResult,
  RenewPackageDraft,
  SellPackageDraft,
  StaffFrontDeskMemberSummary,
  StaffMemberDetail,
} from "@/features/staff-front-desk/types/staff-front-desk.types"
import {
  getCurrentMembership,
  getPackageName,
  normalizeMembershipStatus,
  paymentStatusFromMembership,
} from "@/features/staff-front-desk/utils/staff-status"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

function normalizePackage(item: MockPackageDto): PackageOption {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    durationDays: item.durationDays,
    // Backend that: isActive (boolean). Mock cu: status === "active".
    isActive: item.isActive ?? item.status === "active",
  }
}

function normalizeMembership(
  item: MockMembershipDto,
  packages: MockPackageDto[],
): MembershipSnapshot {
  const gymPackage = packages.find((packageItem) => packageItem.id === item.packageId)

  return {
    id: item.id,
    memberId: item.memberId,
    packageId: item.packageId,
    packageName: gymPackage?.name ?? "Unknown package",
    status: normalizeMembershipStatus(item.status),
    paymentStatus: paymentStatusFromMembership(item.status),
    startsAt: item.startDate,
    endsAt: item.endDate,
    price: gymPackage?.price ?? 0,
    currency: "VND",
  }
}

function normalizeMemberSummary(
  member: MockMemberDto,
  packages: MockPackageDto[],
  memberships: MockMembershipDto[],
  checkins: MockCheckInDto[] = [],
): StaffFrontDeskMemberSummary {
  const membership = getCurrentMembership(member.id, memberships)
  const membershipStatus = normalizeMembershipStatus(membership?.status ?? member.status)
  const lastCheckInAt = checkins
    .filter((item) => item.memberId === member.id)
    .at(-1)?.checkInAt

  return {
    id: member.id,
    memberCode: member.memberCode,
    fullName: member.fullName,
    email: member.email,
    phone: member.phone,
    accountStatus: member.status === "active" ? "active" : "unknown",
    membershipStatus,
    currentPackageName: getPackageName(
      membership?.packageId ?? member.currentPackageId,
      packages,
    ),
    membershipEndsAt: membership?.endDate ?? null,
    lastCheckInAt: lastCheckInAt ?? null,
  }
}

async function getPackagesDto(accessToken: string) {
  return apiRequest<MockPackageDto[]>("/api/v1/packages", {
    headers: authHeaders(accessToken),
  })
}

async function getMembershipsDto(accessToken: string) {
  // Backend that tra paged {items,...}; mock cu tra mang phang -> chap nhan ca 2.
  const data = await apiRequest<
    MockMembershipDto[] | PagedResult<MockMembershipDto>
  >("/api/v1/memberships", {
    headers: authHeaders(accessToken),
  })
  return Array.isArray(data) ? data : data.items
}

async function getCheckInsDto(accessToken: string) {
  return apiRequest<MockCheckInDto[]>("/api/v1/checkins", {
    headers: authHeaders(accessToken),
  })
}

export async function searchStaffMembers(accessToken: string, query: string) {
  const [membersPage, packages, memberships, checkins] = await Promise.all([
    apiRequest<PagedResult<MockMemberDto>>(
      `/api/v1/members?query=${encodeURIComponent(query)}&page=1`,
      {
        headers: authHeaders(accessToken),
      },
    ),
    getPackagesDto(accessToken),
    getMembershipsDto(accessToken),
    getCheckInsDto(accessToken),
  ])

  return {
    ...membersPage,
    items: membersPage.items.map((member) =>
      normalizeMemberSummary(member, packages, memberships, checkins),
    ),
  }
}

export async function getStaffMemberDetail(accessToken: string, memberId: number) {
  const [member, packages, memberships, checkins] = await Promise.all([
    apiRequest<MockMemberDto>(`/api/v1/members/${memberId}`, {
      headers: authHeaders(accessToken),
    }),
    getPackagesDto(accessToken),
    getMembershipsDto(accessToken),
    getCheckInsDto(accessToken),
  ])
  const currentMembership = getCurrentMembership(member.id, memberships)
  const summary = normalizeMemberSummary(member, packages, memberships, checkins)
  const normalizedMembership = currentMembership
    ? normalizeMembership(currentMembership, packages)
    : null

  return {
    member: summary,
    currentMembership: normalizedMembership,
    recentCheckIns: checkins
      .filter((item) => item.memberId === member.id)
      .map((item): CheckInSummary => ({
        id: item.id,
        memberId: item.memberId,
        checkInAt: item.checkInAt,
        source: item.source,
      })),
    availableActions: [
      "sell-package",
      "renew-package",
      normalizedMembership?.paymentStatus === "pending"
        ? "record-payment"
        : "check-in",
    ],
  } satisfies StaffMemberDetail
}

export async function getStaffPackages(accessToken: string) {
  const packages = await getPackagesDto(accessToken)

  return packages.map(normalizePackage)
}

export async function sellStaffMembership(
  accessToken: string,
  draft: SellPackageDraft,
) {
  const response = await apiRequest<{ membership: MockMembershipDto }>(
    "/api/v1/memberships/sell",
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({
        memberId: draft.memberId,
        packageId: draft.packageId,
        startDate: draft.startDate,
      }),
    },
  )
  const packages = await getPackagesDto(accessToken)

  return normalizeMembership(response.membership, packages)
}

export async function renewStaffMembership(
  accessToken: string,
  draft: RenewPackageDraft,
) {
  // Backend that: RenewMembershipRequest { packageId, method } — gia han + ghi nhan
  // thanh toan trong 1 buoc (atomic). Phai gui `method` neu khong se 422 VALIDATION_ERROR.
  const response = await apiRequest<MockMembershipDto>(
    `/api/v1/memberships/${draft.membershipId}/renew`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({
        packageId: draft.packageId,
        method: draft.paymentMethod,
      }),
    },
  )
  const packages = await getPackagesDto(accessToken)

  return normalizeMembership(response, packages)
}

export async function recordStaffManualPayment(
  accessToken: string,
  draft: ManualPaymentDraft,
) {
  const response = await apiRequest<{
    membership: MockMembershipDto
    payment: { id: number; membershipId: number; paidAt?: string }
    status: string
  }>(`/api/v1/memberships/${draft.membershipId}/payment`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      amount: draft.amount,
      method: draft.paymentMethod,
      paidAt: draft.paidAt,
    }),
  })
  const packages = await getPackagesDto(accessToken)
  const membership = normalizeMembership(response.membership, packages)

  return {
    paymentId: response.payment.id,
    membershipId: response.payment.membershipId,
    status: "paid",
    paidAt: response.payment.paidAt ?? draft.paidAt,
    message: "Đã ghi nhận thanh toán. Gói hội viên đang hoạt động.",
    membership,
  } satisfies ManualPaymentResult
}

export async function createStaffCheckIn(accessToken: string, memberId: number) {
  const response = await apiRequest<MockCheckInDto>("/api/v1/checkins", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ memberId, source: "front-desk" }),
  })

  return {
    checkInId: response.id,
    memberId: response.memberId,
    status: "checked-in",
    checkedInAt: response.checkInAt,
    safeMessage: "Đã xác nhận check-in.",
  } satisfies CheckInResult
}
