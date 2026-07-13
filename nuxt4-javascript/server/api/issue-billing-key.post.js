import { billingKeyMap } from "../utils/billing-key-map";
import { requestTossApi, getSecretKeys } from "../utils/toss";

export default defineEventHandler(async (event) => {
  const { customerKey, authKey } = await readBody(event);
  const { apiSecretKey } = getSecretKeys(event);

  const result = await requestTossApi(event, {
    url: "https://api.tosspayments.com/v1/billing/authorizations/issue",
    secretKey: apiSecretKey,
    body: {
      customerKey,
      authKey,
    },
  });

  if (result.status < 400) {
    billingKeyMap.set(customerKey, result.data.billingKey);
  }

  setResponseStatus(event, result.status);
  return result.data;
});
