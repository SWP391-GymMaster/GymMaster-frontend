export type GymPackage = {
  id: number
  name: string
  durationDays: number
  price: number
  status: "active" | "inactive"
}

export type Membership = {
  id: number
  memberId: number
  packageId: number
  startDate: string
  endDate: string
  status: "pending_payment" | "active" | "expired" | "cancelled"
}

// Spec 003 / ADR-05 — member gui yeu cau gia han, admin/staff xac nhan sau.
export type RenewalRequestResult = {
  id: number
  packageId: number
  status: string
}

export type Payment = {
  id: number
  membershipId: number
  memberId: number
  memberName: string
  packageName: string
  amount: number
  paymentMethod: "cash" | "transfer" | "card"
  paymentDate: string
  status: "paid" | "pending" | "refunded"
}

export type CreatePackageDraft = {
  name: string
  durationDays: number
  price: number
  status: "active" | "inactive"
}
