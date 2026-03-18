"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";

const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

const amount = {
  currency: "KRW",
  value: 50000,
};

export default function PaymentCheckoutPage() {
  const [customerKey] = useState(() => generateRandomString());
  const [payment, setPayment] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedBillingMethod, setSelectedBillingMethod] = useState("CARD");

  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const nextPayment = tossPayments.payment({ customerKey });
        setPayment(nextPayment);
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    }

    fetchPayment();
  }, [customerKey]);

  async function requestPayment() {
    if (!payment || !selectedPaymentMethod) {
      return;
    }

    switch (selectedPaymentMethod) {
      case "CARD":
        await payment.requestPayment({
          method: "CARD",
          amount,
          orderId: generateRandomString(),
          orderName: "토스 티셔츠 외 2건",
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/fail`,
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
        await payment.requestPayment({
          method: "TRANSFER",
          amount,
          orderId: generateRandomString(),
          orderName: "토스 티셔츠 외 2건",
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/fail`,
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
        await payment.requestPayment({
          method: "VIRTUAL_ACCOUNT",
          amount,
          orderId: generateRandomString(),
          orderName: "토스 티셔츠 외 2건",
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/fail`,
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
        await payment.requestPayment({
          method: "MOBILE_PHONE",
          amount,
          orderId: generateRandomString(),
          orderName: "토스 티셔츠 외 2건",
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/fail`,
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
        });
        break;
      case "CULTURE_GIFT_CERTIFICATE":
        await payment.requestPayment({
          method: "CULTURE_GIFT_CERTIFICATE",
          amount,
          orderId: generateRandomString(),
          orderName: "토스 티셔츠 외 2건",
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/fail`,
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
        });
        break;
      case "FOREIGN_EASY_PAY":
        await payment.requestPayment({
          method: "FOREIGN_EASY_PAY",
          amount: {
            value: 100,
            currency: "USD",
          },
          orderId: generateRandomString(),
          orderName: "토스 티셔츠 외 2건",
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/fail`,
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          foreignEasyPay: {
            provider: "PAYPAL",
            country: "KR",
          },
        });
        break;
      default:
        break;
    }
  }

  async function requestBillingAuth() {
    if (!payment) {
      return;
    }

    await payment.requestBillingAuth({
      method: selectedBillingMethod,
      successUrl: `${window.location.origin}/payment/billing?billingMethod=${selectedBillingMethod}&`,
      failUrl: `${window.location.origin}/fail`,
      customerEmail: "customer123@gmail.com",
      customerName: "김토스",
    });
  }

  return (
    <div className="wrapper">
      <div className="box_section">
        <h1>일반 결제</h1>
        <div id="payment-method" style={{ display: "flex" }}>
          <button id="CARD" className={`button2 ${selectedPaymentMethod === "CARD" ? "active" : ""}`} onClick={() => setSelectedPaymentMethod("CARD")}>
            카드
          </button>
          <button id="TRANSFER" className={`button2 ${selectedPaymentMethod === "TRANSFER" ? "active" : ""}`} onClick={() => setSelectedPaymentMethod("TRANSFER")}>
            계좌이체
          </button>
          <button id="VIRTUAL_ACCOUNT" className={`button2 ${selectedPaymentMethod === "VIRTUAL_ACCOUNT" ? "active" : ""}`} onClick={() => setSelectedPaymentMethod("VIRTUAL_ACCOUNT")}>
            가상계좌
          </button>
          <button id="MOBILE_PHONE" className={`button2 ${selectedPaymentMethod === "MOBILE_PHONE" ? "active" : ""}`} onClick={() => setSelectedPaymentMethod("MOBILE_PHONE")}>
            휴대폰
          </button>
          <button
            id="CULTURE_GIFT_CERTIFICATE"
            className={`button2 ${selectedPaymentMethod === "CULTURE_GIFT_CERTIFICATE" ? "active" : ""}`}
            onClick={() => setSelectedPaymentMethod("CULTURE_GIFT_CERTIFICATE")}
          >
            문화상품권
          </button>
          <button id="FOREIGN_EASY_PAY" className={`button2 ${selectedPaymentMethod === "FOREIGN_EASY_PAY" ? "active" : ""}`} onClick={() => setSelectedPaymentMethod("FOREIGN_EASY_PAY")}>
            해외간편결제
          </button>
        </div>
        <button className="button" onClick={() => requestPayment()}>
          결제하기
        </button>
      </div>
      <div className="box_section">
        <h1>정기 결제</h1>
        <div id="billing-method" style={{ display: "flex" }}>
          <button id="BILLING_CARD" className={`button2 ${selectedBillingMethod === "CARD" ? "active" : ""}`} onClick={() => setSelectedBillingMethod("CARD")}>
            카드 자동결제
          </button>
          <button id="BILLING_TRANSFER" className={`button2 ${selectedBillingMethod === "TRANSFER" ? "active" : ""}`} onClick={() => setSelectedBillingMethod("TRANSFER")}>
            계좌 자동결제
          </button>
        </div>
        <button className="button" onClick={() => requestBillingAuth()}>
          자동결제 수단 등록하기
        </button>
      </div>
    </div>
  );
}

function generateRandomString() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}
