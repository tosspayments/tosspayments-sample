import { tossRequest } from "@/lib/tossApi";

export async function POST(request) {
  const { paymentKey, orderId, amount } = await request.json();
  return tossRequest("/v1/payments/confirm", { orderId, amount, paymentKey }, true);
}
