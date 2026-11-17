<template>
  <div class="box_section" style="width: 600px">
    <img
      width="100px"
      src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
    />

    <h2 id="title" v-if="billingConfirmed">
      {{ billingMethodLabel }} 자동결제 승인에 성공했어요
    </h2>
    <h2 id="title" v-else>{{ billingMethodLabel }} 등록을 완료했어요</h2>

    <div v-if="billingConfirmed === false">
      <button id="confirm" class="button" @click="confirm">
        등록된 빌링키로 자동결제 실행하기
      </button>
    </div>

    <div class="p-grid" style="margin-top: 30px">
      <a
        href="https://docs.tosspayments.com/guides/v2/billing/integration"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button class="button p-grid-col5">연동 문서</button>
      </a>

      <a
        href="https://developers.tosspayments.com/go/techchat"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button
          class="button p-grid-col5"
          style="background-color: #e8f3ff; color: #1b64da"
        >
          실시간 문의
        </button>
      </a>
    </div>
  </div>

  <div
    class="box_section"
    style="width: 600px; text-align: left"
    v-if="responseData"
  >
    <b>Response Data :</b>

    <div id="response" style="white-space: initial">
      <div><b>method:</b> {{ responseData.method || "-" }}</div>
      <div>
        <b>card:</b>
        <pre>{{ responseData.card ? JSON.stringify(responseData.card, null, 2) : "-" }}</pre>
      </div>
      <div>
        <b>transfers:</b>
        <pre>{{ responseData.transfers || responseData.transfer ? JSON.stringify(responseData.transfers || responseData.transfer, null, 2) : "-" }}</pre>
      </div>
      <pre>{{ JSON.stringify(responseData, null, 4) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const responseData = ref(null);
const billingConfirmed = ref(false);
const billingMethod = route.query.billingMethod || "CARD";
const billingMethodLabel = billingMethod === "TRANSFER" ? "계좌 자동결제" : "카드 자동결제";

// 서버로 빌링키 발급을 위해 authKey 를 보내세요.
// @docs https://docs.tosspayments.com/guides/v2/billing/integration
async function issueBillingKey() {
  const requestData = {
    customerKey: route.query.customerKey,
    authKey: route.query.authKey,
  };

  const response = await fetch("/api/issue-billing-key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw { message: json.message, code: json.code };
  }

  return json;
}

issueBillingKey()
  .then((data) => {
    // TODO: 빌링키 발급에 성공했을 경우 UI 처리 로직을 구현하세요.
    responseData.value = data;
  })
  .catch((error) => {
    // TODO: 빌링키 발급에 실패했을 경우 UI 처리 로직을 구현하세요.
    router.replace(`/fail?code=${error.code}&message=${error.message}`);
  });

// 이해를 돕기 위해 브라우저에서 자동결제 승인을 실행해볼 수 있도록 만든 데모 버튼이에요.
// 실제 서비스에서는 브라우저에서 자동결제 승인을 요청하지 말고, 서버의 스케줄러에서 실행하세요.
async function confirm() {
  async function confirmBilling() {
    const requestData = {
      customerKey: route.query.customerKey,
    };

    const response = await fetch("/api/confirm-billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const json = await response.json();

    if (!response.ok) {
      throw { message: json.message, code: json.code };
    }

    return json;
  }

  confirmBilling()
    .then((data) => {
      billingConfirmed.value = true;
      responseData.value = data;
    })
    .catch((error) => {
      router.replace(`/fail?code=${error.code}&message=${error.message}`);
    });
}
</script>
