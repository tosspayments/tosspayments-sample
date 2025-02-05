<template>
  <div class="wrapper">
    <div class="box_section">
      <!-- 결제 UI -->
      <div id="payment-method"></div>

      <!-- 이용약관 UI -->
      <div id="agreement"></div>

      <!-- 쿠폰 체크박스 -->
      <div style="padding-left: 30px">
        <div class="checkable typography--p">
          <label
            htmlFor="coupon-box"
            class="checkable__label typography--regular"
          >
            <input
              :disabled="!ready"
              @change="updateAmount"
              id="coupon-box"
              class="checkable__input"
              type="checkbox"
              aria-checked="true"
            />
            <span class="checkable__label-text">5,000원 쿠폰 적용</span>
          </label>
        </div>
      </div>

      <!-- 결제하기 버튼 -->
      <button
        :disabled="!ready"
        @click="requestPayment"
        class="button"
        style="margin-top: 30px"
      >
        결제하기
      </button>
    </div>

    <div
      class="box_section"
      style="
        padding: 40px 30px 50px 30px;
        margin-top: 30px;
        margin-bottom: 50px;
      "
    >
      <RouterLink to="/brandpay/checkout">
        <button class="button" style="margin-top: 30px">
          위젯 없이 브랜드페이만 연동하기
        </button>
      </RouterLink>

      <RouterLink to="/payment/checkout">
        <button class="button" style="margin-top: 30px">
          위젯 없이 결제창만 연동하기
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<script>
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}

// TODO: clientKey는 개발자센터의 클라이언트 키 > 결제위젯 연동 키로 바꾸세요.
// TODO: server.js 의 secretKey 또한 API 개별 연동 키가 아닌 결제위젯 연동 키의 시크릿 키로 변경해야 합니다.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = generateRandomString();

export default {
  data() {
    return {
      ready: false,
      widgets: null,

      clientKey,
      customerKey,
      amount: {
        currency: "KRW",
        value: 50000,
      },
    };
  },
  methods: {
    async fetchPaymentWidgets() {
      try {
        const tossPayments = await loadTossPayments(this.clientKey);

        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
        const widgets = tossPayments.widgets({ customerKey: this.customerKey });

        // 비회원 결제
        // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

        this.widgets = widgets;
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    },
    async renderPaymentWidgets() {
      if (this.widgets == null) return;

      // ------  주문서의 결제 금액 설정 ------
      // TODO: 위젯의 결제금액을 결제하려는 금액으로 초기화하세요.
      // TODO: renderPaymentMethods, renderAgreement, requestPayment 보다 반드시 선행되어야 합니다.
      // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
      await this.widgets.setAmount(this.amount);

      await Promise.all([
        // ------  결제 UI 렌더링 ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
        this.widgets.renderPaymentMethods({
          selector: "#payment-method",
          // 렌더링하고 싶은 결제 UI의 variantKey
          // 결제 수단 및 스타일이 다른 멀티 UI를 직접 만들고 싶다면 계약이 필요해요.
          // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
          variantKey: "DEFAULT",
        }),
        // ------  이용약관 UI 렌더링 ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderagreement
        this.widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      this.ready = true;
    },
    async requestPayment() {
      if (this.widgets == null || !this.ready) return;

      try {
        // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment

        // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
        // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
        await this.widgets.requestPayment({
          orderId: generateRandomString(), // 고유 주문 번호
          orderName: "토스 티셔츠 외 2건",
          successUrl: window.location.origin + "/widget/success", // 결제 요청이 성공하면 리다이렉트되는 URL
          failUrl: window.location.origin + "/fail", // 결제 요청이 실패하면 리다이렉트되는 URL
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
        });
      } catch (error) {
        // 에러 처리하기
        console.error(error);
      }
    },
    async updateAmount() {
      const coupon = document.getElementById("coupon-box");

      // ------  주문서의 결제 금액이 변경되었을 경우 결제 금액 업데이트 ------
      // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount

      if (coupon.checked) {
        this.amount.value -= 5000;
      } else {
        this.amount.value += 5000;
      }

      await this.widgets.setAmount(this.amount);
    },
  },
  async mounted() {
    await this.fetchPaymentWidgets();
    await this.renderPaymentWidgets();
  },
};
</script>
