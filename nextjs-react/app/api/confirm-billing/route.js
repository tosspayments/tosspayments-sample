import { billingKeyMap, tossRequest } from "@/lib/tossApi";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { customerKey, amount, orderId, orderName, customerEmail, customerName } = await request.json();
  const billingKey = billingKeyMap.get(customerKey);

  if (!billingKey) {
    return NextResponse.json(
      {
        code: "BILLING_KEY_NOT_FOUND",
        message: "등록된 빌링키를 찾을 수 없습니다. 먼저 자동결제 수단을 등록하세요.",
      },
      { status: 400 }
    );
  }

  return tossRequest(`/v1/billing/${billingKey}`, {
    customerKey,
    amount,
    orderId,
    orderName,
    customerEmail,
    customerName,
  });
}
