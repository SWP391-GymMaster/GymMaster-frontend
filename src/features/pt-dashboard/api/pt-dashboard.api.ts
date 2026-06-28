import { apiRequest } from "@/lib/api/http-client"
import type {
  PtAssignedMember,
  PtCheckInRecord,
} from "@/features/pt-dashboard/types/pt-dashboard.types"

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
}

export function getPtAssignedMembers(
  accessToken: string,
): Promise<PtAssignedMember[]> {
  return apiRequest<PtAssignedMember[]>("/api/v1/pt/members", {
    headers: authHeaders(accessToken),
  })
}

// Trang thai check-in hom nay cua cac hoi vien duoc phan cong cho PT.
export function getPtTodayCheckIns(
  accessToken: string,
): Promise<PtCheckInRecord[]> {
  return apiRequest<PtCheckInRecord[]>("/api/v1/pt/checkins/today", {
    headers: authHeaders(accessToken),
  })
}

// PT check-in cho hoi vien duoc phan cong (memberId nam tren URL, khong gui body).
export function createPtCheckIn(
  accessToken: string,
  memberId: number,
): Promise<PtCheckInRecord> {
  return apiRequest<PtCheckInRecord>(`/api/v1/pt/members/${memberId}/checkins`, {
    method: "POST",
    headers: authHeaders(accessToken),
  })
}
