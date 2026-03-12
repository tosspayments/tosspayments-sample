<template>
  <!-- 주문서형 / 결제창형 두 가지 연동 방식을 보여주는 샘플 페이지입니다 -->
  <div class="wrapper wrapper--wide">
    <div class="checkout-types">
      <div class="box_section checkout-types__item">
        <p class="title checkout-types__title">결제위젯 (주문서형)</p>
        <p class="typography--p checkout-types__desc">
          <code class="method">renderPaymentMethods()</code>로 주문서에 결제수단 UI를 삽입하고, <code class="method">requestPayment()</code>로 결제를 요청해요. 결제수단 선택이 주문서 내에서 바로 이루어져요.
        </p>
        <span class="badge">장점</span>
        <ul class="typography--p feature-list">
          <li>결제수단 영역을 주문서에 자연스럽게 녹여 브랜드 일관성 유지에 유리합니다.</li>
          <li>주문서에 결제수단이 미리 노출되어 전환율 최적화에 유리합니다.</li>
          <li>결제위젯 어드민에서 자유롭게 커스터마이징할 수 있습니다.</li>
        </ul>
        <!-- [주문서형] 결제수단 UI 렌더링 영역 -->
        <div id="payment-method"></div>
        <!-- [주문서형] 이용약관 UI 렌더링 영역 -->
        <div id="agreement"></div>
        <!-- 쿠폰 체크박스 -->
        <div class="checkable typography--p">
          <label htmlFor="coupon-box" class="checkable__label typography--regular">
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
        <!-- [주문서형] 결제하기 버튼 -->
        <button :disabled="!ready" @click="requestPayment" class="button button--block">
          결제하기
        </button>
      </div>

      <div class="box_section checkout-types__item">
        <p class="title checkout-types__title">결제위젯 (결제창형)</p>
        <p class="typography--p checkout-types__desc">
          <code class="method">requestPaymentWindow()</code> 로 결제창이 바로 열려요.<br />결제수단 선택도 창 안에서 이루어져요.
        </p>
        <span class="badge">장점</span>
        <ul class="typography--p feature-list">
          <li>버튼 클릭 한 번으로 전체 결제 플로우를 바로 시작할 수 있습니다.</li>
          <li>결제 UI가 별도 창에서 열려 기존 주문서 레이아웃에 영향을 주지 않습니다.</li>
          <li>결제위젯 어드민에서 자유롭게 커스터마이징할 수 있습니다.</li>
        </ul>
        <!-- 결제수단 UI 없음 플레이스홀더 -->
        <div class="payment-method-placeholder">
          결제창이 팝업으로 열려요<br />
          <span class="payment-method-placeholder__sub">결제수단 선택은 창 안에서 이루어져요</span>
        </div>
        <!-- [결제창형] 결제창 열기 버튼 -->
        <button @click="requestPaymentWindow" class="button button--block">
          결제하기
        </button>
      </div>
    </div>

    <div class="checkout-nav-divider">
      <span>위젯 없이 직접 연동하기</span>
    </div>
    <div class="checkout-nav">
      <RouterLink to="/brandpay/checkout">
        <button class="button button--nav">위젯 없이 브랜드페이만 연동하기</button>
      </RouterLink>
      <RouterLink to="/payment/checkout">
        <button class="button button--nav">위젯 없이 결제창만 연동하기</button>
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
      widgetWindow: null,

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

        const widgets = tossPayments.widgets({ customerKey: this.customerKey });
        // 비회원 결제
        // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

        const widgetWindow = tossPayments.widgets({ customerKey: this.customerKey });

        this.widgets = widgets;
        this.widgetWindow = widgetWindow;
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    },
    async renderPaymentWidgets() {
      if (this.widgets == null) return;

      // setAmount는 renderPaymentMethods, renderAgreement, requestPayment 보다 반드시 먼저 호출해야 합니다.
      await this.widgets.setAmount(this.amount);

      await Promise.all([
        this.widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        this.widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);

      this.ready = true;
    },
    async initWidgetWindow() {
      if (this.widgetWindow == null) return;

      // setAmount는 requestPaymentWindow 보다 반드시 먼저 호출해야 합니다.
      await this.widgetWindow.setAmount(this.amount);
    },
    async requestPayment() {
      if (this.widgets == null || !this.ready) return;

      try {
        // 결제 요청 전 orderId, amount를 서버에 저장하세요. (결제 금액 위변조 검증용)
        await this.widgets.requestPayment({
          orderId: generateRandomString(),
          orderName: "토스 티셔츠 외 2건",
          successUrl: window.location.origin + "/widget/success",
          failUrl: window.location.origin + "/fail",
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          // customerMobilePhone: "01012341234",
        });
      } catch (error) {
        console.error(error);
      }
    },
    async requestPaymentWindow() {
      if (this.widgetWindow == null) return;

      try {
        // 결제 요청 전 orderId, amount를 서버에 저장하세요. (결제 금액 위변조 검증용)
        await this.widgetWindow.requestPaymentWindow({
          orderId: generateRandomString(),
          orderName: "토스 티셔츠 외 2건",
          amount: this.amount,
          successUrl: window.location.origin + "/widget/success",
          failUrl: window.location.origin + "/fail",
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          // customerMobilePhone: "01012341234",
        }, {
          variantKey: {
            paymentMethod: "DEFAULT",
            agreement: "AGREEMENT",
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
    async updateAmount() {
      const coupon = document.getElementById("coupon-box");

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
    await this.initWidgetWindow();
  },
};
</script>
