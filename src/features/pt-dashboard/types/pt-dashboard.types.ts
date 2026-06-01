export type PtAssignedMember = {
  id: number
  memberCode: string
  fullName: string
  email: string
  phone: string
  status: "active" | "pending" | "expired"
}
