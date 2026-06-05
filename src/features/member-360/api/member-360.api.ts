import { apiRequest } from "@/lib/api/http-client"
import type { Member360Data } from "@/features/member-360/types/member-360.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export function getMember360Data(
  accessToken: string,
  memberId: number,
): Promise<Member360Data> {
  return apiRequest<Member360Data>(`/api/v1/members/${memberId}/profile-360`, {
    headers: authHeaders(accessToken),
  })
}
