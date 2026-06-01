import { apiRequest } from "@/lib/api/http-client"
import type { PtAssignedMember } from "@/features/pt-dashboard/types/pt-dashboard.types"

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
}

export function getPtAssignedMembers(
  accessToken: string,
): Promise<PtAssignedMember[]> {
  return apiRequest<PtAssignedMember[]>("/api/pt/members", {
    headers: authHeaders(accessToken),
  })
}
