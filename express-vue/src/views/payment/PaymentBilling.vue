<template>
  <div class="box_section" style="width: 600px">
    <img
      width="100px"
      src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
    />

    <h2 id="title" v-if="billingConfirmed">빌링키로 결제에 성공했어요</h2>
    <h2 id="title" v-else>빌링키 발급을 완료했어요</h2>

    <div v-if="billingConfirmed === false">
      <button id="confirm" class="button" @click="confirm">
        강제로 정기결제 실행시키기
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

// 서버로 빌링키 발급을 위해 authKey 를 보내세요.
// @docs https://docs.tosspayments.com/reference#authkey로-카드-빌링키-발급
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

// 일반적으로 정기결제는 특정 시점에 배치를 통해 구현하지만,
// 이해를 돕기 위해 클라이언트에서 강제로 실행해볼 수 있도록 샘플 API 가 구현되어 있습니다.
async function confirm() {
  async function confirmBilling() {
    const requestData = {
      customerKey: route.query.customerKey,
      amount: 4900,
      orderId: generateRandomString(),
      orderName: "토스 프라임 구독",
      customerEmail: "customer123@gmail.com",
      customerName: "김토스",
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

  confirm()
    .then((data) => {
      billingConfirmed.value = true;
      responseData.value = data;
    })
    .catch((error) => {
      router.replace(`/fail?code=${error.code}&message=${error.message}`);
    });
}
</script>
