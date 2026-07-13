import { requestTossApi, getSecretKeys } from "../../utils/toss";

export default defineEventHandler(async (event) => {
  const { paymentKey, orderId, amount, customerKey } = await readBody(event);
  const { apiSecretKey } = getSecretKeys(event);

  const result = await requestTossApi(event, {
    url: "https://api.tosspayments.com/v1/brandpay/payments/confirm",
    secretKey: apiSecretKey,
    body: {
      orderId,
      amount,
      paymentKey,
      customerKey,
    },
  });

  setResponseStatus(event, result.status);
  return result.data;
});
