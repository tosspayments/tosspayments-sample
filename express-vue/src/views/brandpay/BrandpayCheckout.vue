<template>
  <div class="wrapper">
    <div
      class="box_section"
      style="
        padding: 40px 30px 50px 30px;
        margin-top: 30px;
        margin-bottom: 50px;
        display: flex;
        flex-direction: column;
      "
    >
      <button class="button" style="margin-top: 30px" @click="requestPayment">
        결제하기
      </button>
      <button class="button" style="margin-top: 30px" @click="addPaymentMethod">
        결제수단추가
      </button>
      <button
        class="button"
        style="margin-top: 30px"
        @click="changeOneTouchPay"
      >
        원터치페이설정변경
      </button>
      <button class="button" style="margin-top: 30px" @click="changePassword">
        비밀번호변경
      </button>
      <button
        class="button"
        style="margin-top: 30px"
        @click="isOneTouchPayEnabled"
      >
        원터치결제사용가능여부 조회
      </button>
      <button class="button" style="margin-top: 30px" @click="openSettings">
        브랜드페이 설정 열기
      </button>
    </div>
  </div>
</template>

<script>
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}

// TODO: clientKey는 개발자센터의 API 개별 연동 키 > 연동에 사용할 브랜드페이가 계약된 MID > 클라이언트 키로 바꾸세요.
// TODO: server.js 의 secretKey 또한 결제위젯 연동 키가 아닌 API 개별 연동 키의 시크릿 키로 변경해야 합니다.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const customerKey = generateRandomString();

export default {
  data() {
    return {
      brandpay: null,
    };
  },
  methods: {
    async fetchBrandpay() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        // 브랜드페이 객체 생성
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentsbrandpay
        const brandpay = tossPayments.brandpay({
          customerKey,
          // TODO: 개발자센터의 브랜드페이 > Redirect URL 에 아래 URL 을 추가하세요.
          redirectUrl: "http://localhost:3000/api/callback-auth",
        });

        this.brandpay = brandpay;
      } catch (error) {
        console.error("Error fetching brandpay:", error);
      }
    },
    async requestPayment() {
      // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
      // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
      await this.brandpay.requestPayment({
        amount: {
          currency: "KRW",
          value: 50000,
        },
        orderId: generateRandomString(), // 고유 주문번호
        orderName: "토스 티셔츠 외 2건",
        successUrl:
          window.location.origin +
          `/brandpay/success?customerKey=${customerKey}&`, // 결제 요청이 성공하면 리다이렉트되는 URL
        failUrl: window.location.origin + "/fail", // 결제 요청이 실패하면 리다이렉트되는 URL
        customerEmail: "customer123@gmail.com",
        customerName: "김토스",
      });
    },
    async addPaymentMethod() {
      await this.brandpay.addPaymentMethod();
    },
    async changeOneTouchPay() {
      await this.brandpay.changeOneTouchPay();
    },
    async changePassword() {
      await this.brandpay.changePassword();
    },
    async isOneTouchPayEnabled() {
      const result = await this.brandpay.isOneTouchPayEnabled();

      alert(result);
    },
    async openSettings() {
      await this.brandpay.openSettings();
    },
  },
  async mounted() {
    await this.fetchBrandpay();
  },
};
</script>
