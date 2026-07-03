export type MyProfile = {
  id: number
  userId: number
  memberCode: string
  email: string
  fullName: string
  avatarUrl: string | null
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  emergencyContact: string | null
  joinedAt: string
  status: string
  createdAt: string
}

export type UpdateMyProfileInput = Partial<{
  fullName: string
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  emergencyContact: string | null
}>
