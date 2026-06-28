export type TrainerAssignmentStatus = "active" | "ended"

export type TrainerAssignment = {
  id: number
  memberId: number
  trainerId: number
  status: TrainerAssignmentStatus
  assignedAt: string
  endedAt?: string
  auditLogId?: number
}

export type AssignmentCandidateMember = {
  id: number
  memberCode: string
  fullName: string
  email: string
  phone: string
  membershipStatus: "active" | "pending" | "expired"
  currentTrainerId?: number
  currentTrainerName?: string
}

export type AssignmentCandidateTrainer = {
  id: number
  userId: number
  fullName: string
  specialty: string
  status: "active" | "locked"
  assignedCount: number
  capacity: number
}

export type AssignmentCandidateResponse<T> = {
  items: T[]
  total: number
}

export type AssignTrainerInput = {
  memberId: number
  trainerId: number
}

export type AssignTrainerResult = {
  assignment: TrainerAssignment
  previousAssignment?: TrainerAssignment
  auditLogId: number
  message: string
}
