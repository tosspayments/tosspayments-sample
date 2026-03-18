import { billingKeyMap } from "../utils/billing-key-map";
import { requestTossApi, getSecretKeys } from "../utils/toss";

export default defineEventHandler(async (event) => {
  const { customerKey, amount, orderId, orderName, customerEmail, customerName } = await readBody(event);
  const { apiSecretKey } = getSecretKeys(event);

  const result = await requestTossApi(event, {
    url: `https://api.tosspayments.com/v1/billing/${billingKeyMap.get(customerKey)}`,
    secretKey: apiSecretKey,
    body: {
      customerKey,
      amount,
      orderId,
      orderName,
      customerEmail,
      customerName,
    },
  });

  setResponseStatus(event, result.status);
  return result.data;
});
