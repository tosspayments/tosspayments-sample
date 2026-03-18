"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentBillingPage() {
  return (
    <Suspense>
      <PaymentBillingContent />
    </Suspense>
  );
}

function PaymentBillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [responseData, setResponseData] = useState(null);
  const [billingConfirmed, setBillingConfirmed] = useState(false);
  const billingMethod = searchParams.get("billingMethod") || "CARD";
  const billingMethodLabel = billingMethod === "TRANSFER" ? "계좌 자동결제" : "카드 자동결제";

  useEffect(() => {
    async function issueBillingKey() {
      const requestData = {
        customerKey: searchParams.get("customerKey"),
        authKey: searchParams.get("authKey"),
      };

      const response = await fetch("/api/issue-billing-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const json = await response.json();

      if (!response.ok) {
        const error = new Error(json.message);
        error.code = json.code;
        throw error;
      }

      return json;
    }

    issueBillingKey()
      .then((data) => {
        setResponseData(data);
      })
      .catch((err) => {
        router.push(`/fail?message=${encodeURIComponent(err.message)}&code=${encodeURIComponent(err.code)}`);
      });
  }, [router, searchParams]);

  async function confirm() {
    async function confirmBilling() {
      const requestData = {
        customerKey: searchParams.get("customerKey"),
        amount: 4900,
        orderId: generateRandomString(),
        orderName: "토스 프라임 구독",
        customerEmail: "customer123@gmail.com",
        customerName: "김토스",
      };

      const response = await fetch("/api/confirm-billing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const json = await response.json();

      if (!response.ok) {
        const error = new Error(json.message);
        error.code = json.code;
        throw error;
      }

      return json;
    }

    confirmBilling()
      .then((data) => {
        setBillingConfirmed(true);
        setResponseData(data);
      })
      .catch((err) => {
        router.push(`/fail?message=${encodeURIComponent(err.message)}&code=${encodeURIComponent(err.code)}`);
      });
  }

  return (
    <div className="wrapper">
      <div className="box_section" style={{ width: "600px" }}>
        <img width="100px" src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png" alt="성공 이미지" />
        <h2 id="title">{billingConfirmed ? `${billingMethodLabel} 자동결제 승인에 성공했어요` : `${billingMethodLabel} 등록을 완료했어요`}</h2>

        {billingConfirmed === false ? (
          <button id="confirm" className="button" onClick={confirm}>
            등록된 빌링키로 자동결제 실행하기
          </button>
        ) : null}

        <div className="p-grid" style={{ marginTop: "30px" }}>
          <button
            className="button p-grid-col5"
            onClick={() => {
              window.location.href = "https://docs.tosspayments.com/guides/v2/billing/integration";
            }}
          >
            연동 문서
          </button>
          <button
            className="button p-grid-col5"
            onClick={() => {
              window.location.href = "https://discord.gg/A4fRFXQhRu";
            }}
            style={{ backgroundColor: "#e8f3ff", color: "#1b64da" }}
          >
            실시간 문의
          </button>
        </div>
        <div className="box_section" style={{ width: "600px", textAlign: "left" }}>
          <b>Response Data :</b>
          <div id="response" style={{ whiteSpace: "initial" }}>
            {responseData && (
              <>
                <div>
                  <b>method:</b> {responseData.method || "-"}
                </div>
                <div>
                  <b>card:</b>
                  <pre>{responseData.card ? JSON.stringify(responseData.card, null, 2) : "-"}</pre>
                </div>
                <div>
                  <b>transfers:</b>
                  <pre>{responseData.transfers || responseData.transfer ? JSON.stringify(responseData.transfers || responseData.transfer, null, 2) : "-"}</pre>
                </div>
                <pre>{JSON.stringify(responseData, null, 4)}</pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function generateRandomString() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}
