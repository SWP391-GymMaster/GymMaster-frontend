export type Member360Membership = {
  id: number
  memberId?: number
  packageId: number
  packageName: string
  supportsPT: boolean
  startDate: string
  endDate: string
  status: "active" | "pending_payment" | "expired" | "cancelled"
  paymentStatus: "paid" | "pending" | "refunded"
}

export type Member360Data = {
  member: {
    id: number
    memberCode: string
    fullName: string
    email: string
    phone: string
    status: "active" | "pending" | "expired" | "locked"
    dateOfBirth?: string | null
    gender?: string | null
  }
  currentMembership?: Member360Membership | null
  membershipHistory?: Member360Membership[]
  assignedPT?: {
    id: number
    fullName: string
    specialty: string
    assignedAt: string
  }
  recentCheckIns?: {
    id: number
    checkInAt: string
  }[]
}
