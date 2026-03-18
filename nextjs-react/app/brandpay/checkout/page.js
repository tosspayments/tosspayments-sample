"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";

const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

export default function BrandpayCheckoutPage() {
  const [customerKey] = useState(() => generateRandomString());
  const [brandpay, setBrandpay] = useState(null);

  useEffect(() => {
    async function fetchBrandpay() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const nextBrandpay = tossPayments.brandpay({
          customerKey,
          redirectUrl: `${window.location.origin}/api/callback-auth`,
        });

        setBrandpay(nextBrandpay);
      } catch (error) {
        console.error("Error fetching brandpay:", error);
      }
    }

    fetchBrandpay();
  }, [customerKey]);

  async function requestPayment() {
    if (!brandpay) {
      return;
    }

    await brandpay.requestPayment({
      amount: {
        currency: "KRW",
        value: 50000,
      },
      orderId: generateRandomString(),
      orderName: "토스 티셔츠 외 2건",
      successUrl: `${window.location.origin}/brandpay/success?customerKey=${customerKey}&`,
      failUrl: `${window.location.origin}/fail`,
      customerEmail: "customer123@gmail.com",
      customerName: "김토스",
    });
  }

  async function addPaymentMethod() {
    if (brandpay) {
      await brandpay.addPaymentMethod();
    }
  }

  async function changeOneTouchPay() {
    if (brandpay) {
      await brandpay.changeOneTouchPay();
    }
  }

  async function changePassword() {
    if (brandpay) {
      await brandpay.changePassword();
    }
  }

  async function isOneTouchPayEnabled() {
    if (brandpay) {
      const result = await brandpay.isOneTouchPayEnabled();
      alert(result);
    }
  }

  async function openSettings() {
    if (brandpay) {
      await brandpay.openSettings();
    }
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
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}
