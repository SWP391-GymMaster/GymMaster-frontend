export type GymPackage = {
  id: number
  name: string
  durationDays: number
  price: number
  status: "active" | "inactive"
  supportsPT: boolean
}

export type Membership = {
  id: number
  memberId: number
  packageId: number
  packageName?: string
  supportsPT: boolean
  startDate: string
  endDate: string
  status: "pending_payment" | "active" | "expired" | "cancelled"
  createdAt?: string
}

// Spec 003 / ADR-05 — member gui yeu cau gia han, admin/staff xac nhan sau.
export type RenewalRequestResult = {
  id: number
  packageId: number
  packageName?: string
  supportsPT?: boolean
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
  // Trang thai goi tap gan voi lan thanh toan nay (BE tra kem) -> lich su trung thuc:
  // vd da thanh toan nhung goi da bi Cancelled/Expired.
  membershipStatus?: "pending_payment" | "active" | "expired" | "cancelled"
}

export type CreatePackageDraft = {
  name: string
  durationDays: number
  price: number
  status: "active" | "inactive"
  supportsPT: boolean
}

// Spec 003 §6 — GET /payments/summary (bao cao doanh thu)
export type PaymentMethodSummary = {
  paymentMethod: string
  count: number
  amount: number
}

export type DailyRevenue = {
  date: string
  count: number
  amount: number
}

export type PaymentSummary = {
  from?: string | null
  to?: string | null
  totalPayments: number
  paidPayments: number
  pendingPayments: number
  revenue: number
  byMethod: PaymentMethodSummary[]
  byDay: DailyRevenue[]
}
