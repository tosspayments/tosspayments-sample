import { tossRequest } from "@/lib/tossApi";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customerKey = searchParams.get("customerKey");
  const code = searchParams.get("code");

  return tossRequest("/v1/brandpay/authorizations/access-token", {
    grantType: "AuthorizationCode",
    customerKey,
    code,
  });
}
