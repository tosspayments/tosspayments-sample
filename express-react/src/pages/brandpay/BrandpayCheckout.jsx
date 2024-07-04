import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";

// ------  SDK 초기화 ------
// TODO: clientKey는 개발자센터의 API 개별 연동 키 > 연동에 사용할 브랜드페이가 계약된 MID > 클라이언트 키로 바꾸세요.
// TODO: server.js 의 secretKey 또한 결제위젯 연동 키가 아닌 API 개별 연동 키의 시크릿 키로 변경해야 합니다.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const customerKey = generateRandomString();

export function BrandpayCheckoutPage() {
  const [brandpay, setBrandpay] = useState(null);

  useEffect(() => {
    async function fetchBrandpay() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        // 브랜드페이 객체 생성
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentsbrandpay
        const brandpay = tossPayments.brandpay({
          customerKey,
          // TODO: 개발자센터의 브랜드페이 > Redirect URL 에 아래 URL 을 추가하세요.
          redirectUrl: "http://localhost:3000/api/callback-auth",
        });

        setBrandpay(brandpay);
      } catch (error) {
        console.error("Error fetching brandpay:", error);
      }
    }

    fetchBrandpay();
  }, []);

  // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
  // @docs https://docs.tosspayments.com/sdk/v2/js#brandpayrequestpayment
  async function requestPayment() {
    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
    await brandpay.requestPayment({
      amount: {
        currency: "KRW",
        value: 50000,
      },
      orderId: generateRandomString(), // 고유 주문번호
      orderName: "토스 티셔츠 외 2건",
      successUrl: window.location.origin + `/brandpay/success?customerKey=${customerKey}&`, // 결제 요청이 성공하면 리다이렉트되는 URL
      failUrl: window.location.origin + "/fail", // 결제 요청이 실패하면 리다이렉트되는 URL
      customerEmail: "customer123@gmail.com",
      customerName: "김토스",
    });
  }

  async function addPaymentMethod() {
    await brandpay.addPaymentMethod();
  }

  async function changeOneTouchPay() {
    await brandpay.changeOneTouchPay();
  }

  async function changePassword() {
    await brandpay.changePassword();
  }

  async function isOneTouchPayEnabled() {
    const result = await brandpay.isOneTouchPayEnabled();

    alert(result);
  }

  async function openSettings() {
    await brandpay.openSettings();
  }

  return (
    <div className="wrapper">
      <div
        className="box_section"
        style={{
          padding: "40px 30px 50px 30px",
          marginTop: "30px",
          marginBottom: "50px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button className="button" style={{ marginTop: "30px" }} onClick={requestPayment}>
          결제하기
        </button>
        <button className="button" style={{ marginTop: "30px" }} onClick={addPaymentMethod}>
          결제수단추가
        </button>
        <button className="button" style={{ marginTop: "30px" }} onClick={changeOneTouchPay}>
          원터치페이설정변경
        </button>
        <button className="button" style={{ marginTop: "30px" }} onClick={changePassword}>
          비밀번호변경
        </button>
        <button className="button" style={{ marginTop: "30px" }} onClick={isOneTouchPayEnabled}>
          원터치결제사용가능여부 조회
        </button>
        <button className="button" style={{ marginTop: "30px" }} onClick={openSettings}>
          브랜드페이 설정 열기
        </button>
      </div>
    </div>
  );
}

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}
