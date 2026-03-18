import { NextResponse } from "next/server";

const widgetSecretKey = process.env.TOSS_WIDGET_SECRET_KEY || "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
const apiSecretKey = process.env.TOSS_API_SECRET_KEY || "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";

const encryptedWidgetSecretKey = `Basic ${Buffer.from(`${widgetSecretKey}:`).toString("base64")}`;
const encryptedApiSecretKey = `Basic ${Buffer.from(`${apiSecretKey}:`).toString("base64")}`;

export const billingKeyMap = new Map();

export async function tossRequest(path, body, useWidgetSecret = false) {
  const response = await fetch(`https://api.tosspayments.com${path}`, {
    method: "POST",
    headers: {
      Authorization: useWidgetSecret ? encryptedWidgetSecretKey : encryptedApiSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  return NextResponse.json(result, { status: response.status });
}
