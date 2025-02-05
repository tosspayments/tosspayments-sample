<template>
  <div id="info" class="box_section" style="width: 600px">
    <img
      width="100px"
      src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"
      alt="에러 이미지"
    />
    <h2>결제를 실패했어요</h2>

    <div class="p-grid typography--p" style="margin-top: 50px">
      <div class="p-grid-col text--left">
        <b>에러메시지</b>
      </div>
      <div class="p-grid-col text--right" id="message">
        {{ this.$route.query.message }}
      </div>
    </div>
    <div class="p-grid typography--p" style="margin-top: 10px">
      <div class="p-grid-col text--left">
        <b>에러코드</b>
      </div>
      <div class="p-grid-col text--right" id="code">
        {{ this.$route.query.code }}
      </div>
    </div>

    <div class="p-grid-col">
      <a
        href="https://docs.tosspayments.com/guides/v2/payment-widget/integration"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button class="button p-grid-col5">연동 문서</button>
      </a>
      <a
        href="https://developers.tosspayments.com/go/techchat"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button
          class="button p-grid-col5"
          style="background-color: #e8f3ff; color: #1b64da"
        >
          실시간 문의
        </button>
      </a>
    </div>
  </div>
</template>
