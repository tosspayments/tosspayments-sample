<template>
  <div class="wrapper">
    <div class="box_section">
      <h1>일반 결제</h1>

      <div id="payment-method" style="display: flex">
        <button id="CARD" v-bind:class="{ active: selectedPaymentMethod === 'CARD' }" class="button2" @click="selectedPaymentMethod = 'CARD'">카드</button>
        <button id="TRANSFER" v-bind:class="{ active: selectedPaymentMethod === 'TRANSFER' }" class="button2" @click="selectedPaymentMethod = 'TRANSFER'">계좌이체</button>
        <button id="VIRTUAL_ACCOUNT" v-bind:class="{ active: selectedPaymentMethod === 'VIRTUAL_ACCOUNT' }" class="button2" @click="selectedPaymentMethod = 'VIRTUAL_ACCOUNT'">가상계좌</button>
        <button id="MOBILE_PHONE" v-bind:class="{ active: selectedPaymentMethod === 'MOBILE_PHONE' }" class="button2" @click="selectedPaymentMethod = 'MOBILE_PHONE'">휴대폰</button>
        <button
          id="CULTURE_GIFT_CERTIFICATE"
          v-bind:class="{ active: selectedPaymentMethod === 'CULTURE_GIFT_CERTIFICATE' }"
          class="button2"
          @click="selectedPaymentMethod = 'CULTURE_GIFT_CERTIFICATE'"
        >
          문화상품권
        </button>
        <button id="FOREIGN_EASY_PAY" v-bind:class="{ active: selectedPaymentMethod === 'FOREIGN_EASY_PAY' }" class="button2" @click="selectedPaymentMethod = 'FOREIGN_EASY_PAY'">
          해외간편결제
        </button>
      </div>

      <button class="button" @click="requestPayment">결제하기</button>
    </div>

    <div class="box_section">
      <h1>정기 결제</h1>
      <div id="billing-method" style="display: flex">
        <button id="BILLING_CARD" v-bind:class="{ active: selectedBillingMethod === 'CARD' }" class="button2" @click="selectedBillingMethod = 'CARD'">카드 자동결제</button>
        <button id="BILLING_TRANSFER" v-bind:class="{ active: selectedBillingMethod === 'TRANSFER' }" class="button2" @click="selectedBillingMethod = 'TRANSFER'">계좌 자동결제</button>
      </div>
      <button class="button" @click="requestBillingAuth">자동결제 수단 등록하기</button>
    </div>
  </div>
</template>

<script>
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}

// TODO: clientKey는 개발자센터의 API 개별 연동 키 > 결제창 연동에 사용하려할 MID > 클라이언트 키로 바꾸세요.
// TODO: server.js 의 secretKey 또한 결제위젯 연동 키가 아닌 API 개별 연동 키의 시크릿 키로 변경해야 합니다.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const amount = {
  currency: "KRW",
  value: 50000,
};

export default {
  data() {
    return {
      payment: null,
      customerKey: "",
      selectedPaymentMethod: null,
      selectedBillingMethod: "CARD",
    };
  },
  methods: {
    async fetchPayment() {
      try {
        this.customerKey = generateRandomString();
        const tossPayments = await loadTossPayments(clientKey);

        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
        const payment = tossPayments.payment({ customerKey: this.customerKey });

        this.payment = payment;
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    },
    async requestPayment() {
      try {
        switch (this.selectedPaymentMethod) {
          case "CARD":
            await this.payment.requestPayment({
              method: "CARD",
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              card: {
                useEscrow: false,
                flowMode: "DEFAULT",
                useCardPoint: false,
                useAppCardOnly: false,
              },
            });
            break;
          case "TRANSFER":
            await this.payment.requestPayment({
              method: "TRANSFER",
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              transfer: {
                cashReceipt: {
                  type: "소득공제",
                },
                useEscrow: false,
              },
            });
            break;
          case "VIRTUAL_ACCOUNT":
            await this.payment.requestPayment({
              method: "VIRTUAL_ACCOUNT",
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              virtualAccount: {
                cashReceipt: {
                  type: "소득공제",
                },
                useEscrow: false,
                validHours: 24,
              },
            });
            break;
          case "MOBILE_PHONE":
            await this.payment.requestPayment({
              method: "MOBILE_PHONE",
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
            });
            break;
          case "CULTURE_GIFT_CERTIFICATE":
            await this.payment.requestPayment({
              method: "CULTURE_GIFT_CERTIFICATE",
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
            });
            break;
          case "FOREIGN_EASY_PAY":
            await this.payment.requestPayment({
              method: "FOREIGN_EASY_PAY",
              amount: {
                value: 100,
                currency: "USD",
              },
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              foreignEasyPay: {
                provider: "PAYPAL",
                country: "KR",
              },
            });
            break;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async requestBillingAuth() {
      await this.payment.requestBillingAuth({
        method: this.selectedBillingMethod,
        successUrl: window.location.origin + `/payment/billing?billingMethod=${this.selectedBillingMethod}&`,
        failUrl: window.location.origin + "/fail",
        customerEmail: "customer123@gmail.com",
        customerName: "김토스",
      });
    },
  },
  async mounted() {
    await this.fetchPayment();
  },
};
</script>
