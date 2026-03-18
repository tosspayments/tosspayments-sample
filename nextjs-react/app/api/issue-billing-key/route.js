import { billingKeyMap, tossRequest } from "@/lib/tossApi";

export async function POST(request) {
  const { customerKey, authKey } = await request.json();

  const response = await tossRequest("/v1/billing/authorizations/issue", { customerKey, authKey });
  const result = await response.json();

  if (response.ok) {
    billingKeyMap.set(customerKey, result.billingKey);
  }

  return Response.json(result, { status: response.status });
}
