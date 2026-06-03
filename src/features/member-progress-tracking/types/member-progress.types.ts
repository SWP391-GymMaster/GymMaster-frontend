export type MockProgressEntry = {
  id: number
  memberId: number
  measuredAt: string // YYYY-MM-DD
  weightKg: number
  bodyFatPct?: number // optional
}

export type CreateProgressEntryInput = {
  measuredAt: string
  weightKg: number
  bodyFatPct?: number
}
