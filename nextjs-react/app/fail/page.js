"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function FailPage() {
  return (
    <Suspense>
      <FailContent />
    </Suspense>
  );
}

function FailContent() {
  const searchParams = useSearchParams();

  return (
    <div id="info" className="box_section" style={{ width: "600px" }}>
      <img width="100px" src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png" alt="에러 이미지" />
      <h2>결제를 실패했어요</h2>

      <div className="p-grid typography--p" style={{ marginTop: "50px" }}>
        <div className="p-grid-col text--left">
          <b>에러메시지</b>
        </div>
        <div className="p-grid-col text--right" id="message">{`${searchParams.get("message")}`}</div>
      </div>
      <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
        <div className="p-grid-col text--left">
          <b>에러코드</b>
        </div>
        <div className="p-grid-col text--right" id="code">{`${searchParams.get("code")}`}</div>
      </div>

      <div className="p-grid-col">
        <a className="button p-grid-col5" href="https://docs.tosspayments.com/guides/v2/payment-widget/integration" target="_blank" rel="noreferrer">
          연동 문서
        </a>
        <a className="button p-grid-col5" href="https://discord.gg/A4fRFXQhRu" target="_blank" rel="noreferrer" style={{ backgroundColor: "#e8f3ff", color: "#1b64da" }}>
          실시간 문의
        </a>
      </div>
    </div>
  );
}
