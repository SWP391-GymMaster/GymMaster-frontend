export type GymPackage = {
  id: number
  name: string
  durationDays: number
  price: number
  status: "active" | "locked"
}

export type Membership = {
  id: number
  memberId: number
  packageId: number
  startDate: string
  endDate: string
  status: "PendingPayment" | "Active" | "Expired"
}

export type Payment = {
  id: number
  membershipId: number
  memberId: number
  memberName: string
  packageName: string
  amount: number
  paymentMethod: string
  paymentDate: string
  status: "paid" | "pending" | "failed"
}

export type CreatePackageDraft = {
  name: string
  durationDays: number
  price: number
  status: "active" | "locked"
}
