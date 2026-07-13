import { requestTossApi, getSecretKeys } from "../utils/toss";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const customerKey = query.customerKey;
  const code = query.code;
  const { apiSecretKey } = getSecretKeys(event);

  const result = await requestTossApi(event, {
    url: "https://api.tosspayments.com/v1/brandpay/authorizations/access-token",
    secretKey: apiSecretKey,
    body: {
      grantType: "AuthorizationCode",
      customerKey,
      code,
    },
  });

  setResponseStatus(event, result.status);
  return result.data;
});
