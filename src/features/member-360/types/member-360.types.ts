export type Member360Data = {
  member: {
    id: number
    memberCode: string
    fullName: string
    email: string
    phone: string
    status: "active" | "pending" | "expired" | "locked"
  }
  currentMembership?: {
    id: number
    packageName: string
    startDate: string
    endDate: string
    status: "Active" | "PendingPayment" | "Expired"
    paymentStatus: "paid" | "pending" | "failed"
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
