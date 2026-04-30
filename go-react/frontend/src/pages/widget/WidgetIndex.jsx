import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export function WidgetIndexPage() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState({ currency: "KRW", value: 50000 });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const [widgetWindow, setWidgetWindow] = useState(null);

  useEffect(() => {
    async function init() {
      const tossPayments = await loadTossPayments(clientKey);

      // 결제위젯 (주문서형)
      // TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
      // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
      const w = tossPayments.widgets({ customerKey: generateRandomString() });
      // 비회원 결제
      // const w = tossPayments.widgets({ customerKey: ANONYMOUS });

      // 결제위젯 (결제창형)
      const ww = tossPayments.widgets({ customerKey: generateRandomString() });

      setWidgets(w);
      setWidgetWindow(ww);
    }
    init();
  }, []);

  useEffect(() => {
    if (widgets == null) return;

    async function renderPaymentWidgets() {
      // ------  주문서의 결제 금액 설정 ------
      // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
      await widgets.setAmount(amount);

      await Promise.all([
        // ------  결제 UI 렌더링 ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        // ------  이용약관 UI 렌더링 ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderagreement
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  return (
    <div>
      <div style={{ display: "flex", gap: "30px", maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        {/* 주문서형 결제 */}
        <div className="wrapper" style={{ flex: 1, display: "flex" }}>
          <div className="box_section" style={{ padding: "40px 30px 50px 30px", marginTop: "30px", marginBottom: "50px", flex: 1 }}>
            <h2 className="title">주문서형 결제</h2>
            <p style={{ margin: "8px 0 24px", color: "#8b95a1", fontSize: "14px" }}>주문서 안에서 결제 방법 선택(widget/checkout)</p>
            {/* 결제 UI */}
            <div id="payment-method" />
            {/* 이용약관 UI */}
            <div id="agreement" />
            {/* 쿠폰 체크박스 */}
            <div style={{ paddingLeft: "30px" }}>
              <div className="checkable typography--p">
                <label htmlFor="coupon-box" className="checkable__label typography--regular">
                  <input
                    id="coupon-box"
                    className="checkable__input"
                    type="checkbox"
                    aria-checked="true"
                    disabled={!ready}
                    // ------  주문서의 결제 금액이 변경되었을 경우 결제 금액 업데이트 ------
                    // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
                    onChange={async (event) => {
                      await widgets.setAmount({
                        currency: amount.currency,
                        value: event.target.checked ? amount.value - 5000 : amount.value,
                      });
                    }}
                  />
                  <span className="checkable__label-text">5,000원 쿠폰 적용</span>
                </label>
              </div>
            </div>
            {/* 결제하기 버튼 */}
            <button
              className="button"
              style={{ marginTop: "30px" }}
              disabled={!ready}
              // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
              // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
              onClick={async () => {
                try {
                  // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
                  // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
                  await widgets.requestPayment({
                    orderId: generateRandomString(),
                    orderName: "토스 티셔츠 외 2건",
                    successUrl: window.location.origin + "/widget/success",
                    failUrl: window.location.origin + "/fail",
                    customerEmail: "customer123@gmail.com",
                    customerName: "김토스",
                    // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
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
        </div>

        {/* 결제창형 결제 */}
        <div className="wrapper" style={{ flex: 1, display: "flex" }}>
          <div
            className="box_section"
            style={{ padding: "40px 30px 50px 30px", marginTop: "30px", marginBottom: "50px", flex: 1, display: "flex", flexDirection: "column" }}
          >
            <h2 className="title">결제창형 결제</h2>
            <p style={{ margin: "8px 0 24px", color: "#8b95a1", fontSize: "14px" }}>결제하기 버튼을 눌러 결제창 열기(widget/checkout-window)</p>
            {/* 주문서형과 높이를 맞추기 위한 플레이스홀더 */}
            <div
              style={{
                flex: 1,
                border: "2px dashed #d1d5db",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                gap: "8px",
                color: "#8b95a1",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600 }}>결제수단 선택 UI 없음</span>
              <span style={{ fontSize: "13px", textAlign: "center" }}>버튼 누르면 결제수단을 선택할 수 있는 결제창이 열립니다.</span>
            </div>
            {/* 결제하기 버튼 */}
            <button
              className="button"
              style={{ marginTop: "30px" }}
              onClick={async () => {
                // ------  주문서의 결제 금액 설정 ------
                // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
                await widgetWindow.setAmount({ currency: "KRW", value: 50000 });

                // ------  결제창 렌더링 ------
                // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentwindow
                const widgetPaymentWindow = await widgetWindow.renderPaymentWindow({
                  variantKey: { paymentMethod: "DEFAULT", agreement: "AGREEMENT" },
                });

                // 구매자가 결제창에서 결제 요청 버튼을 누르면 발생하는 이벤트
                widgetPaymentWindow.on("paymentRequest", async () => {
                  try {
                    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
                    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
                    await widgetWindow.requestPayment({
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
              }}
            >
              결제하기
            </button>
          </div>
        </div>
      </div>

      {/* 다른 연동 방식으로 이동하기 */}
      <div className="wrapper">
        <div className="box_section" style={{ padding: "40px 30px 50px 30px", marginTop: "30px", marginBottom: "50px" }}>
          <button className="button" style={{ marginTop: "30px" }} onClick={() => navigate("/brandpay/checkout")}>
            위젯 없이 브랜드페이만 연동하기
          </button>
          <button className="button" style={{ marginTop: "30px" }} onClick={() => navigate("/payment/checkout")}>
            위젯 없이 결제창만 연동하기
          </button>
        </div>
      </div>
    </div>
  );
}

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}
