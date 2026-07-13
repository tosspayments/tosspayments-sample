<template>
  <div class="wrapper">
    <div class="box_section" style="padding: 40px 30px 50px 30px; margin-top: 30px; margin-bottom: 50px">
      <!-- 결제하기 버튼 -->
      <button @click="openPaymentWindow" class="button">결제하기</button>
    </div>
  </div>
</template>

<script>
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}

// TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = generateRandomString();

export default {
  data() {
    return {
      widgetWindow: null,
    };
  },
  methods: {
    async openPaymentWindow() {
      // ------  주문서의 결제 금액 설정 ------
      // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
      await this.widgetWindow.setAmount({ currency: "KRW", value: 50000 });

      // ------  결제창 렌더링 ------
      // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentwindow
      const widgetPaymentWindow = await this.widgetWindow.renderPaymentWindow({
        variantKey: { paymentMethod: "DEFAULT", agreement: "AGREEMENT" },
      });

      // 구매자가 결제창에서 결제 요청 버튼을 누르면 발생하는 이벤트
      widgetPaymentWindow.on("paymentRequest", async () => {
        try {
          // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
          // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
          await this.widgetWindow.requestPayment({
            orderId: generateRandomString(),
            orderName: "토스 티셔츠 외 2건",
            successUrl: window.location.origin + "/widget/success",
            failUrl: window.location.origin + "/fail",
            customerEmail: "customer123@gmail.com",
            customerName: "김토스",
            // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
            customerMobilePhone: "01012341234",
          });
        } catch (error) {
          console.error(error);
        }

        // 가맹점이 원하는 시점에 결제창을 제거하세요 (결제 완료 후, 일정 시간 후 등).
        await widgetPaymentWindow.destroy();
      });
    },
  },
  async mounted() {
    const tossPayments = await loadTossPayments(clientKey);

    // 회원 결제
    // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
    this.widgetWindow = tossPayments.widgets({ customerKey });
    // 비회원 결제
    // this.widgetWindow = tossPayments.widgets({ customerKey: ANONYMOUS });
  },
};
</script>
