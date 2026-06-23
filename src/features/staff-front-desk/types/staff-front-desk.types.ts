export type StaffAccountStatus = "active" | "locked" | "cancelled" | "unknown"

export type StaffMembershipStatus =
  | "active"
  | "pending"
  | "expired"
  | "locked"
  | "cancelled"
  | "unknown"

export type PaymentStatus =
  | "paid"
  | "pending"
  | "refunded"
  | "cancelled"
  | "unknown"

export type StaffAction =
  | "sell-package"
  | "renew-package"
  | "record-payment"
  | "check-in"

export type StaffFrontDeskMemberSummary = {
  id: number
  memberCode: string
  fullName: string
  email: string
  phone: string
  accountStatus: StaffAccountStatus
  membershipStatus: StaffMembershipStatus
  currentPackageName?: string
  membershipEndsAt?: string | null
  lastCheckInAt?: string | null
}

export type MembershipSnapshot = {
  id: number
  memberId: number
  packageId: number
  packageName: string
  status: StaffMembershipStatus
  paymentStatus: PaymentStatus
  startsAt: string
  endsAt: string
  price: number
  currency: string
}

export type CheckInSummary = {
  id: number
  memberId: number
  checkInAt: string
  source: string
}

export type StaffMemberDetail = {
  member: StaffFrontDeskMemberSummary
  currentMembership: MembershipSnapshot | null
  recentCheckIns: CheckInSummary[]
  availableActions: StaffAction[]
}

export type PackageOption = {
  id: number
  name: string
  price: number
  durationDays: number
  isActive: boolean
  description?: string
}

export type SellPackageDraft = {
  memberId: number
  packageId: number
  startDate: string
  paymentMethod: "cash" | "transfer" | "card"
}

export type RenewPackageDraft = {
  membershipId: number
  packageId: number
  startDate: string
  paymentMethod: "cash" | "transfer" | "card"
}

export type ManualPaymentDraft = {
  membershipId: number
  amount: number
  paymentMethod: "cash" | "transfer" | "card"
  paidAt: string
}

export type ManualPaymentResult = {
  paymentId: number
  membershipId: number
  status: PaymentStatus
  paidAt: string | null
  message?: string
  membership?: MembershipSnapshot
}

export type CheckInResult = {
  checkInId?: number
  memberId?: number
  status: "checked-in" | "denied" | "failed"
  checkedInAt?: string | null
  reasonCode?: string
  safeMessage: string
}

export type StaffOperationError = {
  code: string
  message: string
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export type MockMemberDto = {
  id: number
  memberCode: string
  fullName: string
  email: string
  phone: string
  status: string
  currentPackageId?: number
  assignedTrainerId?: number
}

export type MockPackageDto = {
  id: number
  name: string
  durationDays: number
  price: number
  // Mock cu dung status string; backend that dung isActive boolean.
  status?: string
  isActive?: boolean
}

export type MockMembershipDto = {
  id: number
  memberId: number
  packageId: number
  startDate: string
  endDate: string
  status: string
}

export type MockCheckInDto = {
  id: number
  memberId: number
  checkInAt: string
  source: string
}
