import { apiRequest } from "@/lib/api/http-client";

export type VnPayCreateResult = {
  paymentId: number;
  membershipId: number;
  amount: number;
  payUrl: string;
};

export type VnPayReturnStatus = {
  paymentId: number;
  membershipId: number;
  status: string;
  membershipStatus: string;
  paidAt: string | null;
};

export async function createVnpayUrl(
  accessToken: string,
  membershipId: number,
): Promise<VnPayCreateResult> {
  return apiRequest<VnPayCreateResult>(
    "/api/v1/payments/vnpay/create-url",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ membershipId }),
    },
  );
}

export async function getVnpayReturnStatus(
  search: string,
): Promise<VnPayReturnStatus> {
  return apiRequest<VnPayReturnStatus>(
    `/api/v1/payments/vnpay/return${search}`,
    { method: "GET" },
  );
}
