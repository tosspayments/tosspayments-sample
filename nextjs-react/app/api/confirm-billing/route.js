import { billingKeyMap, tossRequest } from "@/lib/tossApi";

export async function POST(request) {
  const { customerKey, amount, orderId, orderName, customerEmail, customerName } = await request.json();
  return tossRequest(`/v1/billing/${billingKeyMap.get(customerKey)}`, {
    customerKey,
    amount,
    orderId,
    orderName,
    customerEmail,
    customerName,
  });
}
