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
    currentMembership?: {
      id: number
      packageName: string
      startDate: string
      endDate: string
      status: "active" | "pending_payment" | "expired" | "cancelled"
      paymentStatus: "paid" | "pending" | "refunded"
    }
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
