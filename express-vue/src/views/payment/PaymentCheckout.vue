<template>
  <div class="wrapper">
    <div class="box_section">
      <h1>일반 결제</h1>

      <div id="payment-method" style="display: flex">
        <button
          id="CARD"
          v-bind:class="{ active: selectedPaymentMethod === 'CARD' }"
          class="button2"
          @click="selectedPaymentMethod = 'CARD'"
        >
          카드
        </button>
        <button
          id="TRANSFER"
          v-bind:class="{ active: selectedPaymentMethod === 'TRANSFER' }"
          class="button2"
          @click="selectedPaymentMethod = 'TRANSFER'"
        >
          계좌이체
        </button>
        <button
          id="VIRTUAL_ACCOUNT"
          v-bind:class="{ active: selectedPaymentMethod === 'VIRTUAL_ACCOUNT' }"
          class="button2"
          @click="selectedPaymentMethod = 'VIRTUAL_ACCOUNT'"
        >
          가상계좌
        </button>
        <button
          id="MOBILE_PHONE"
          v-bind:class="{ active: selectedPaymentMethod === 'MOBILE_PHONE' }"
          class="button2"
          @click="selectedPaymentMethod = 'MOBILE_PHONE'"
        >
          휴대폰
        </button>
        <button
          id="CULTURE_GIFT_CERTIFICATE"
          v-bind:class="{
            active: selectedPaymentMethod === 'CULTURE_GIFT_CERTIFICATE',
          }"
          class="button2"
          @click="selectedPaymentMethod = 'CULTURE_GIFT_CERTIFICATE'"
        >
          문화상품권
        </button>
        <button
          id="FOREIGN_EASY_PAY"
          v-bind:class="{
            active: selectedPaymentMethod === 'FOREIGN_EASY_PAY',
          }"
          class="button2"
          @click="selectedPaymentMethod = 'FOREIGN_EASY_PAY'"
        >
          해외간편결제
        </button>
      </div>

      <!-- 결제하기 버튼 -->
      <button class="button" @click="requestPayment">결제하기</button>
    </div>

    <div class="box_section">
      <h1>정기 결제</h1>
      <button class="button" @click="requestBillingAuth">
        빌링키 발급하기
      </button>
    </div>
  </div>
</template>

<script>
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}

// TODO: clientKey는 개발자센터의 API 개별 연동 키 > 결제창 연동에 사용하려할 MID > 클라이언트 키로 바꾸세요.
// TODO: server.js 의 secretKey 또한 결제위젯 연동 키가 아닌 API 개별 연동 키의 시크릿 키로 변경해야 합니다.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const customerKey = generateRandomString();
const amount = {
  currency: "KRW",
  value: 50000,
};

export default {
  data() {
    return {
      payment: null,
      selectedPaymentMethod: null,
    };
  },
  methods: {
    async fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
        const payment = tossPayments.payment({ customerKey });

        // 비회원 결제
        // const payment = tossPayments.payment({ customerKey: ANONYMOUS });

        this.payment = payment;
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    },
    async requestPayment() {
      try {
        // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment

        // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
        // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
        switch (this.selectedPaymentMethod) {
          case "CARD":
            await this.payment.requestPayment({
              method: "CARD", // 카드 및 간편결제
              amount,
              orderId: generateRandomString(), // 고유 주문번호
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success", // 결제 요청이 성공하면 리다이렉트되는 URL
              failUrl: window.location.origin + "/fail", // 결제 요청이 실패하면 리다이렉트되는 URL
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
              // customerMobilePhone: "01012341234",
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
              method: "TRANSFER", // 계좌이체 결제
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
              // customerMobilePhone: "01012341234",
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
              method: "VIRTUAL_ACCOUNT", // 가상계좌 결제
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
              // customerMobilePhone: "01012341234",
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
              method: "MOBILE_PHONE", // 휴대폰 결제
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
              // customerMobilePhone: "01012341234",
            });
            break;
          case "CULTURE_GIFT_CERTIFICATE":
            await this.payment.requestPayment({
              method: "CULTURE_GIFT_CERTIFICATE", // 문화상품권 결제
              amount,
              orderId: generateRandomString(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
              // customerMobilePhone: "01012341234",
            });
            break;
          case "FOREIGN_EASY_PAY":
            await this.payment.requestPayment({
              method: "FOREIGN_EASY_PAY", // 해외 간편결제
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
              // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
              // customerMobilePhone: "01012341234",
              foreignEasyPay: {
                provider: "PAYPAL", // PayPal 결제
                country: "KR",
              },
            });
            break;
        }
      } catch (error) {
        // 에러 처리하기
        console.error(error);
      }
    },
    async requestBillingAuth() {
      await this.payment.requestBillingAuth({
        method: "CARD", // 자동결제(빌링)은 카드만 지원합니다
        successUrl: window.location.origin + "/payment/billing", // 요청이 성공하면 리다이렉트되는 URL
        failUrl: window.location.origin + "/fail", // 요청이 실패하면 리다이렉트되는 URL
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
