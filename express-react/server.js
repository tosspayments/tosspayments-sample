const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// TODO: 개발자센터에 로그인해서 내 결제위젯 연동 키 > 시크릿 키를 입력하세요. 시크릿 키는 외부에 공개되면 안돼요.
// @docs https://docs.tosspayments.com/reference/using-api/api-keys
const secretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

// 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
// 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
// @docs https://docs.tosspayments.com/reference/using-api/authorization#%EC%9D%B8%EC%A6%9D
const encryptedSecretKey = "Basic " + Buffer.from(secretKey + ":").toString("base64");

// 결제 승인
app.post("/confirm", function (req, res) {
  const { paymentKey, orderId, amount } = req.body;

  // 결제 승인 API를 호출하세요.
  // 결제를 승인하면 결제수단에서 금액이 차감돼요.
  // @docs https://docs.tosspayments.com/guides/v2/payment-widget/integration#3-결제-승인하기
  fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId: orderId,
      amount: amount,
      paymentKey: paymentKey,
    }),
  }).then(async function (response) {
    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      // TODO: 결제 승인 실패 비즈니스 로직을 구현하세요.
      res.status(response.status).json(result);

      return;
    }

    // TODO: 결제 완료 비즈니스 로직을 구현하세요.
    res.status(response.status).json(result);
  });
});

// 브랜드페이 Access Token 발급
app.get("/callback-auth", function (req, res) {
  const { customerKey, code } = req.query;

  // 요청으로 받은 customerKey 와 요청한 주체가 동일인인지 검증 후 Access Token 발급 API 를 호출하세요.
  // @docs https://docs.tosspayments.com/reference/brandpay#access-token-발급
  fetch("https://api.tosspayments.com/v1/brandpay/authorizations/access-token", {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grantType: "AuthorizationCode",
      customerKey,
      code,
    }),
  }).then(async function (response) {
    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      // TODO: 발급 실패 비즈니스 로직을 구현하세요.
      res.status(response.status).json(result);

      return;
    }

    // TODO: 발급 성공 비즈니스 로직을 구현하세요.
    res.status(response.status).json(result);
  });
});

const billingKeyMap = new Map();

// 빌링키 발급
app.post("/issue-billing-key", function (req, res) {
  const { customerKey, authKey } = req.body;

  // AuthKey 로 카드 빌링키 발급 API 를 호출하세요
  // @docs https://docs.tosspayments.com/reference#authkey로-카드-빌링키-발급
  fetch(`https://api.tosspayments.com/v1/billing/authorizations/issue`, {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerKey,
      authKey,
    }),
  }).then(async function (response) {
    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      // TODO: 빌링키 발급 실패 비즈니스 로직을 구현하세요.
      res.status(response.status).json(result);

      return;
    }

    // TODO: 빌링키 발급 성공 비즈니스 로직을 구현하세요.
    // TODO: 발급된 빌링키를 구매자 정보로 찾을 수 있도록 저장해두고, 결제가 필요한 시점에 조회하여 카드 자동결제 승인 API 를 호출합니다.
    billingKeyMap.set(customerKey, result.billingKey);
    res.status(response.status).json(result);
  });
});

// 카드 자동결제 승인
app.post("/confirm-billing", function (req, res) {
  const { customerKey, amount, orderId, orderName, customerEmail, customerName } = req.body;

  // 저장해두었던 빌링키로 카드 자동결제 승인 API 를 호출하세요.
  fetch(`https://api.tosspayments.com/v1/billing/${billingKeyMap.get(customerKey)}`, {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerKey,
      amount,
      orderId,
      orderName,
      customerEmail,
      customerName,
    }),
  }).then(async function (response) {
    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      // TODO: 자동결제 승인 실패 비즈니스 로직을 구현하세요.
      res.status(response.status).json(result);

      return;
    }

    // TODO: 자동결제 승인 성공 비즈니스 로직을 구현하세요.
    res.status(response.status).json(result);
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 으로 API 서버가 실행되었습니다.`);
});
