<template>
  <div class="box_section" style="width: 600px">
    <img
      width="100px"
      src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
    />

    <h2>결제를 완료했어요</h2>
    <div class="p-grid typography--p" style="margin-top: 50px">
      <div class="p-grid-col text--left">
        <b>결제금액</b>
      </div>
      <div class="p-grid-col text--right" id="amount">
        {{ Number(route.query.amount).toLocaleString() }}원
      </div>
    </div>

    <div class="p-grid typography--p" style="margin-top: 10px">
      <div class="p-grid-col text--left">
        <b>주문번호</b>
      </div>
      <div class="p-grid-col text--right" id="orderId">
        {{ route.query.orderId }}
      </div>
    </div>

    <div class="p-grid typography--p" style="margin-top: 10px">
      <div class="p-grid-col text--left">
        <b>paymentKey</b>
      </div>
      <div
        class="p-grid-col text--right"
        id="paymentKey"
        style="white-space: initial; width: 250px"
      >
        {{ route.query.paymentKey }}
      </div>
    </div>

    <div class="p-grid-col">
      <a
        href="https://docs.tosspayments.com/guides/v2/brandpay/integration"
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

async function confirm() {
  const requestData = {
    orderId: route.query.orderId,
    amount: route.query.amount,
    paymentKey: route.query.paymentKey,
    customerKey: route.query.customerKey,
  };

  const response = await fetch("/api/confirm/brandpay", {
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
    responseData.value = data;
  })
  .catch((error) => {
    router.replace(`/fail?code=${error.code}&message=${error.message}`);
  });
</script>
