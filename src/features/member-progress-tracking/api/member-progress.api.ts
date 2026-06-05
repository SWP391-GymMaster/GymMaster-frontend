import { apiRequest } from "@/lib/api/http-client"
import type {
  MockProgressEntry,
  CreateProgressEntryInput,
} from "@/features/member-progress-tracking/types/member-progress.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function getMemberProgress(
  accessToken: string,
  memberId: number,
) {
  return apiRequest<MockProgressEntry[]>(
    `/api/v1/members/${memberId}/progress`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export async function createProgressEntry(
  accessToken: string,
  memberId: number,
  input: CreateProgressEntryInput,
) {
  return apiRequest<MockProgressEntry>(
    `/api/v1/members/${memberId}/progress`,
    {
      method: "POST",
      headers: {
        ...authHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  )
}
