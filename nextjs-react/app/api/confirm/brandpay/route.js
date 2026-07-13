import { tossRequest } from "@/lib/tossApi";

export async function POST(request) {
  const { paymentKey, orderId, amount, customerKey } = await request.json();
  return tossRequest("/v1/brandpay/payments/confirm", { orderId, amount, paymentKey, customerKey });
}
