import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function PaymentBillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [responseData, setResponseData] = useState(null);
  const [billingConfirmed, setBillingConfirmed] = useState(false);
  const billingMethod = searchParams.get("billingMethod") || "CARD";
  const billingMethodLabel = billingMethod === "TRANSFER" ? "계좌 자동결제" : "카드 자동결제";

  useEffect(() => {
    // 서버로 빌링키 발급을 위해 authKey 를 보내세요.
    // @docs https://docs.tosspayments.com/guides/v2/billing/integration
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
        throw { message: json.message, code: json.code };
      }

      return json;
    }

    issueBillingKey()
      .then(function (data) {
        // TODO: 빌링키 발급에 성공했을 경우 UI 처리 로직을 구현하세요.
        setResponseData(data);
      })
      .catch((err) => {
        // TODO: 빌링키 발급에 실패했을 경우 UI 처리 로직을 구현하세요.
        navigate(`/fail?message=${err.message}&code=${err.code}`);
      });
  }, []);

  // 일반적으로 정기결제는 특정 시점에 배치를 통해 구현하지만,
  // 이해를 돕기 위해 클라이언트에서 강제로 실행해볼 수 있도록 샘플 API 가 구현되어 있습니다.
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
        throw { message: json.message, code: json.code };
      }

      return json;
    }

    confirmBilling()
      .then(function (data) {
        setBillingConfirmed(true);
        setResponseData(data);
      })
      .catch((err) => {
        navigate(`/fail?message=${err.message}&code=${err.code}`);
      });
  }

  return (
    <div className="wrapper">
      <div className="box_section" style={{ width: "600px" }}>
        <img width="100px" src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png" />
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
              location.href = "https://docs.tosspayments.com/guides/v2/billing/integration";
            }}
          >
            연동 문서
          </button>
          <button
            className="button p-grid-col5"
            onClick={() => {
              location.href = "https://discord.gg/A4fRFXQhRu";
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
  return window.btoa(Math.random().toString()).slice(0, 20);
}
