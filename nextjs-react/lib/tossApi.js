import { NextResponse } from "next/server";

const TEST_WIDGET_SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
const TEST_API_SECRET_KEY = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";

export const billingKeyMap = new Map();

function getSecretKey(useWidgetSecret) {
  const secretKey = useWidgetSecret ? process.env.TOSS_WIDGET_SECRET_KEY : process.env.TOSS_API_SECRET_KEY;

  if (secretKey) {
    return secretKey;
  }

  if (process.env.NODE_ENV !== "production") {
    return useWidgetSecret ? TEST_WIDGET_SECRET_KEY : TEST_API_SECRET_KEY;
  }

  throw new Error(useWidgetSecret ? "TOSS_WIDGET_SECRET_KEY is required in production." : "TOSS_API_SECRET_KEY is required in production.");
}

export async function tossRequest(path, body, useWidgetSecret = false) {
  const secretKey = getSecretKey(useWidgetSecret);
  const encryptedSecretKey = `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;

  const response = await fetch(`https://api.tosspayments.com${path}`, {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  return NextResponse.json(result, { status: response.status });
}
