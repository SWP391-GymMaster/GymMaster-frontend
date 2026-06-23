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
  message: "Không thể kết nối dịch vụ GymMaster. Vui lòng thử lại.",
}

const emptyProtectedResponseErrors: Partial<Record<number, ApiError>> = {
  401: {
    code: "UNAUTHORIZED",
    message: "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.",
  },
  403: {
    code: "FORBIDDEN",
    message: "Bạn không có quyền truy cập khu vực này.",
  },
}

export function normalizeApiPath(path: string) {
  if (!path.startsWith("/api") || path.startsWith("/api/v1")) {
    return path
  }

  const nextChar = path.at(4)
  if (nextChar === undefined || nextChar === "/" || nextChar === "?") {
    return `/api/v1${path.slice(4)}`
  }

  return path
}

function getApiUrl(path: string) {
  if (
    process.env.NEXT_PUBLIC_API_MOCKING === "enabled" ||
    process.env.NODE_ENV === "test"
  ) {
    return path
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5042"

  return `${baseUrl}${normalizeApiPath(path)}`
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  let payload: ApiResponse<T>

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    const protectedError = emptyProtectedResponseErrors[response.status]

    if (protectedError) {
      throw new ApiClientError(protectedError, response.status)
    }

    throw new ApiClientError(
      {
        code: "INVALID_RESPONSE",
        message: "GymMaster trả về phản hồi không hợp lệ.",
      },
      response.status,
    )
  }

  if (!response.ok || !payload.success || payload.error) {
    throw new ApiClientError(
      payload.error ?? {
        code: "REQUEST_FAILED",
        message: "GymMaster không thể hoàn tất yêu cầu này.",
      },
      response.status,
    )
  }

  if (payload.data === null) {
    throw new ApiClientError(
      {
        code: "EMPTY_RESPONSE",
        message: "GymMaster trả về phản hồi rỗng.",
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
