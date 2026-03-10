import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// TODO: server.js 의 secretKey 또한 결제위젯 연동 키가 아닌 API 개별 연동 키의 시크릿 키로 변경해야 합니다.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = generateRandomString();

export function WidgetCheckoutPage() {
  const navigate = useNavigate();

  const [amount] = useState({
    currency: "KRW",
    value: 50000,
  });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const [widgetWindow, setWidgetWindow] = useState(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        const widgets = tossPayments.widgets({ customerKey });
        // 비회원 결제
        // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

        const widgetWindow = tossPayments.widgets({ customerKey });

        setWidgets(widgets);
        setWidgetWindow(widgetWindow);
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    }

    fetchPaymentWidgets();
  }, []);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return;
      }

      // setAmount는 renderPaymentMethods, renderAgreement, requestPayment 보다 반드시 먼저 호출해야 합니다.
      await widgets.setAmount(amount);

      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  useEffect(() => {
    async function initWidgetWindow() {
      if (widgetWindow == null) return;

      // setAmount는 requestPaymentWindow 보다 반드시 먼저 호출해야 합니다.
      await widgetWindow.setAmount(amount);
    }

    initWidgetWindow();
  }, [widgetWindow]);

  return (
    <div className="wrapper wrapper--wide">
      <div className="checkout-types">
        <div className="box_section checkout-types__item">
          <p className="title checkout-types__title">결제위젯 (주문서형)</p>
          <p className="typography--p checkout-types__desc">
            <code className="method">renderPaymentMethods()</code>로 주문서에 결제수단 UI를 삽입하고, <code className="method">requestPayment()</code>로 결제를 요청해요. 결제수단 선택이 주문서 내에서 바로 이루어져요.
          </p>
          <span className="badge">장점</span>
          <ul className="typography--p feature-list">
            <li>결제수단 영역을 주문서에 자연스럽게 녹여 브랜드 일관성 유지에 유리합니다.</li>
            <li>주문서에 결제수단이 미리 노출되어 전환율 최적화에 유리합니다.</li>
            <li>결제위젯 어드민에서 자유롭게 커스터마이징할 수 있습니다.</li>
          </ul>
          {/* [주문서형] 결제수단 UI 렌더링 영역 */}
          <div id="payment-method" />
          {/* [주문서형] 이용약관 UI 렌더링 영역 */}
          <div id="agreement" />
          {/* 쿠폰 체크박스 */}
          <div className="checkable typography--p">
            <label htmlFor="coupon-box" className="checkable__label typography--regular">
              <input
                id="coupon-box"
                className="checkable__input"
                type="checkbox"
                aria-checked="true"
                disabled={!ready}
                onChange={async (event) => {
                  await widgets.setAmount({
                    currency: "KRW",
                    value: event.target.checked ? amount.value - 5000 : amount.value,
                  });
                }}
              />
              <span className="checkable__label-text">5,000원 쿠폰 적용</span>
            </label>
          </div>
          {/* [주문서형] 결제하기 버튼 */}
          <button
            className="button button--block"
            disabled={!ready}
            onClick={async () => {
              try {
                // 결제 요청 전 orderId, amount를 서버에 저장하세요. (결제 금액 위변조 검증용)
                await widgets.requestPayment({
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
            }}
          >
            결제하기
          </button>
        </div>
        <div className="box_section checkout-types__item">
          <p className="title checkout-types__title">결제위젯 (결제창형)</p>
          <p className="typography--p checkout-types__desc">
            <code className="method">requestPaymentWindow()</code> 로 결제창이 바로 열려요.<br />결제수단 선택도 창 안에서 이루어져요.
          </p>
          <span className="badge">장점</span>
          <ul className="typography--p feature-list">
            <li>버튼 클릭 한 번으로 전체 결제 플로우를 바로 시작할 수 있습니다.</li>
            <li>결제 UI가 별도 창에서 열려 기존 주문서 레이아웃에 영향을 주지 않습니다.</li>
            <li>결제위젯 어드민에서 자유롭게 커스터마이징할 수 있습니다.</li>
          </ul>
          {/* 결제수단 UI 없음 플레이스홀더 */}
          <div className="payment-method-placeholder">
            결제창이 팝업으로 열려요<br />
            <span className="payment-method-placeholder__sub">결제수단 선택은 창 안에서 이루어져요</span>
          </div>
          {/* [결제창형] 결제창 열기 버튼 */}
          <button
            className="button button--block"
            onClick={async () => {
              try {
                // 결제 요청 전 orderId, amount를 서버에 저장하세요. (결제 금액 위변조 검증용)
                await widgetWindow.requestPaymentWindow({
                  orderId: generateRandomString(),
                  orderName: "토스 티셔츠 외 2건",
                  amount,
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
            }}
          >
            결제하기
          </button>
        </div>
      </div>
      <div className="checkout-nav-divider">
        <span>위젯 없이 직접 연동하기</span>
      </div>
      <div className="checkout-nav">
        <button className="button button--nav" onClick={() => navigate("/brandpay/checkout")}>
          위젯 없이 브랜드페이만 연동하기
        </button>
        <button className="button button--nav" onClick={() => navigate("/payment/checkout")}>
          위젯 없이 결제창만 연동하기
        </button>
      </div>
    </div>
  );
}

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}
