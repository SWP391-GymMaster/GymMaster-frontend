export type PtAssignedMember = {
  id: number
  memberCode: string
  fullName: string
  email: string
  phone: string
  status: "active" | "pending" | "expired"
}

// Khop CheckInResponse cua backend: { id, memberId, checkInAt, source }.
export type PtCheckInRecord = {
  id: number
  memberId: number
  checkInAt: string
  source: string
}
