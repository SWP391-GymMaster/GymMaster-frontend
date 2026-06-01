import type { ApiError, ApiResponse } from "@/types/auth"

export class ApiClientError extends Error {
  code: string
  requestId?: string
  status?: number

  constructor(error: ApiError, status?: number) {
    super(error.message)
    this.name = "ApiClientError"
    this.code = error.code
    this.requestId = error.requestId
    this.status = status
  }
}

const fallbackError: ApiError = {
  code: "NETWORK_ERROR",
  message: "Unable to reach GymMaster services. Please try again.",
}

function getApiUrl(path: string) {
  if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    return path
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (process.env.NODE_ENV === "test" ? "" : "http://localhost:5042")

  return `${baseUrl}${path}`
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  let payload: ApiResponse<T>

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiClientError(
      {
        code: "INVALID_RESPONSE",
        message: "GymMaster returned an invalid response.",
      },
      response.status,
    )
  }

  if (!response.ok || !payload.success || payload.error) {
    throw new ApiClientError(
      payload.error ?? {
        code: "REQUEST_FAILED",
        message: "GymMaster could not complete this request.",
      },
      response.status,
    )
  }

  if (payload.data === null) {
    throw new ApiClientError(
      {
        code: "EMPTY_RESPONSE",
        message: "GymMaster returned an empty response.",
      },
      response.status,
    )
  }

  return payload.data
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(getApiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    })

    return parseApiResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    throw new ApiClientError(fallbackError)
  }
}
